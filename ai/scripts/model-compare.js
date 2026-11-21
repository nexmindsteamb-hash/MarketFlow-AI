require("dotenv").config({ quiet: true });
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Put your 2-3 model IDs here
const MODELS = ["gemini-4-hydrogen", "gemini-3.8-flash"];

const PROMPT =
  "Write one Instagram caption for a digital marketing agency that helps small businesses grow. Max 150 characters, include 3 hashtags.";

async function run(model, temperature) {
  const start = Date.now();
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: PROMPT,
        config: { temperature },
      });
      return { model, temperature, ms: Date.now() - start, text: res.text, attempt };
    } catch (err) {
      if (attempt === 4) return { model, temperature, error: err.message };
      await new Promise((r) => setTimeout(r, attempt * 3000)); // wait 3s, 6s, 9s
    }
  }
}

async function main() {
  for (const model of MODELS) {
    for (const t of [0.2, 0.9]) {
      const r = await run(model, t);
      console.log("\n---", r.model, "| temperature", r.temperature);
      console.log(r.error ? "ERROR: " + r.error : `${r.ms} ms\n${r.text}`);
    }
  }
}

main();