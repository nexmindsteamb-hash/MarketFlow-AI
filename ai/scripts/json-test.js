require("dotenv").config({ quiet: true });
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const res = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL,
    contents:
      'Create a social post for a digital marketing agency. Return JSON with keys: caption, hashtags (array), cta.',
    config: { responseMimeType: "application/json", temperature: 0.5 },
  });
  const data = JSON.parse(res.text);
  console.log(data);
}

main().catch((e) => console.error("Failed:", e.message));