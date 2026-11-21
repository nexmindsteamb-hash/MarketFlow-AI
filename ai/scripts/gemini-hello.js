require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL,
    contents: "Write one short Instagram caption for a digital marketing agency.",
  });
  console.log(response.text);
}

main().catch((err) => {
  console.error("Gemini call failed:", err.message);
  process.exit(1);
});