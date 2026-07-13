const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const Document = require("../models/Document");
const getEmbedding = require("../utils/embeddings");

const chatModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-flash-latest",
  temperature: 0.2,
});

// @desc  Ask a question about an uploaded document using RAG
// @route POST /api/chat/ask
const askQuestion = async (req, res) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({ message: "documentId and question are required" });
    }

    // 1. Convert the user's question into an embedding
    const questionEmbedding = await getEmbedding(question);

    // 2. Run a vector search against MongoDB to find the most relevant chunks
    const results = await Document.aggregate([
      { $match: { _id: new (require("mongoose").Types.ObjectId)(documentId) } },
      { $unwind: "$chunks" },
      {
        $addFields: {
          similarity: {
            $let: {
              vars: { queryVector: questionEmbedding },
              in: { $meta: "vectorSearchScore" },
            },
          },
        },
      },
    ]);

    // NOTE: Simpler approach — use $vectorSearch directly on the chunks
    const vectorResults = await Document.aggregate([
      {
        $vectorSearch: {
          index: "autoembed_index",
          path: "chunks.embedding",
          queryVector: questionEmbedding,
          numCandidates: 100,
          limit: 5,
          filter: { _id: new (require("mongoose").Types.ObjectId)(documentId) },
        },
      },
      { $project: { fileName: 1, chunks: 1 } },
    ]);

    // 3. Build context from retrieved chunks
    const contextText = vectorResults
      .map((doc) => doc.chunks.map((c) => c.text).join("\n"))
      .join("\n");

    // 4. Ask Gemini to answer using only the retrieved context
    const prompt = `You are a helpful assistant. Answer the question using ONLY the context below. If the answer isn't in the context, say you don't know.

Context:
${contextText}

Question: ${question}

Answer:`;

    const response = await chatModel.invoke(prompt);

    res.json({
      answer: response.content,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { askQuestion };