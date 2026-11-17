const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const mongoose = require("mongoose");
const Document = require("../models/Document");
const getEmbedding = require("../utils/embeddings");

// Ek fail ho toh agla model try hoga
const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite"];

const chatModels = MODELS.map(
  (name) =>
    new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: name,
      temperature: 0.2,
      maxRetries: 0, // retry hum khud kar rahe hain
    })
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const isRetryable = (err) =>
  /503|429|500|overloaded|high demand/i.test(String(err?.message || ""));

async function invokeWithRetry(prompt) {
  let lastError;
  for (let m = 0; m < chatModels.length; m++) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await chatModels[m].invoke(prompt);
        return response.content;
      } catch (err) {
        lastError = err;
        console.error(`[Gemini] ${MODELS[m]} attempt ${attempt} failed:`, err.message);
        if (!isRetryable(err)) throw err;
        await sleep(1000 * attempt);
      }
    }
  }
  throw lastError;
}

// @desc  Ask a question about an uploaded document using RAG
// @route POST /api/chat/ask
const askQuestion = async (req, res) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({ message: "documentId and question are required" });
    }

    // 1. Question ko embedding me convert karo
    const questionEmbedding = await getEmbedding(question);

    // 2. MongoDB vector search se relevant chunks nikalo
    const vectorResults = await Document.aggregate([
      {
        $vectorSearch: {
          index: "autoembed_index",
          path: "chunks.embedding",
          queryVector: questionEmbedding,
          numCandidates: 100,
          limit: 5,
          filter: { _id: new mongoose.Types.ObjectId(documentId) },
        },
      },
      { $project: { fileName: 1, chunks: 1 } },
    ]);

    // 3. Context banao
    const contextText = vectorResults
      .map((doc) => doc.chunks.map((c) => c.text).join("\n"))
      .join("\n");

    // 4. Gemini se answer lo (retry + fallback ke saath)
    const prompt = `You are a helpful assistant. Answer the question using ONLY the context below. If the answer isn't in the context, say you don't know.

Context:
${contextText}

Question: ${question}

Answer:`;

    const answer = await invokeWithRetry(prompt);
    res.json({ answer });
  } catch (error) {
    console.error("Chat error:", error);
    const busy = /503|high demand|overloaded|429/i.test(error.message || "");
    res.status(busy ? 503 : 500).json({
      message: busy
        ? "AI abhi busy hai, thodi der baad try karo."
        : error.message,
    });
  }
};

module.exports = { askQuestion };