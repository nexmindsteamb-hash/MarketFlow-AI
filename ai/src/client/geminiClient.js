
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env"), quiet: true });
const { GoogleGenAI } = require("@google/genai");

const config = {
    retryDelayMs: Number(process.env.GEMINI_RETRY_DELAY_MS) || 2000,
  model: process.env.GEMINI_MODEL,
  fallbackModel: process.env.GEMINI_FALLBACK_MODEL,
  timeoutMs: Number(process.env.GEMINI_TIMEOUT_MS) || 30000,
  maxRetries: Number(process.env.GEMINI_MAX_RETRIES) || 3,
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const e = new Error("Gemini request timed out");
      e.status = 408;
      reject(e);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

const isRetryable = (err) => [408, 429, 500, 503].includes(err.status);

async function callModel(model, prompt, options) {
    
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      const res = await withTimeout(
        ai.models.generateContent({ model, contents: prompt, config: options }),
        config.timeoutMs
      );
      return res.text;
    } catch (err) {
      if (!isRetryable(err) || attempt === config.maxRetries) throw err;
      await sleep(attempt * config.retryDelayMs);
    }
  }
}

async function generate(prompt, options = {}) {
  const models = [config.model, config.fallbackModel].filter(Boolean);
  let lastError;
  for (const model of models) {
    try {
      const text = await callModel(model, prompt, options);
      return { text, model };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

async function healthCheck() {
  const start = Date.now();
  try {
    const { text, model } = await generate("Reply with the single word OK.");
    return { ok: true, model, ms: Date.now() - start, reply: text.trim() };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}



module.exports = { generate, healthCheck };