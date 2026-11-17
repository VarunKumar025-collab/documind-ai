const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Ek fail ho toh agla try hoga
const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const isRetryable = (err) => {
  const msg = String(err?.message || "");
  return /503|429|500|overloaded|high demand/i.test(msg);
};

async function generateWithRetry(prompt) {
  let lastError;
  for (const modelName of MODELS) {
    const model = genAI.getGenerativeModel({ model: modelName });
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err) {
        lastError = err;
        console.error(`[Gemini] ${modelName} attempt ${attempt} failed:`, err.message);
        if (!isRetryable(err)) throw err;
        await sleep(1000 * attempt);
      }
    }
  }
  throw lastError;
}

module.exports = { generateWithRetry };