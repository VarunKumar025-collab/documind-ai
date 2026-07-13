const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");

const embeddingModel = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-embedding-2-preview",
});

async function getEmbedding(text) {
  const result = await embeddingModel.embedQuery(text);
  return result;
}

module.exports = getEmbedding;