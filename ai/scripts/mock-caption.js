const { generate } = require("../src/client/geminiClient");
const { platformRules } = require("../src/config/platformRules");
const data = require("../fixtures/mock-company-data.json");

async function main() {
  const item = data.items[0];
  const rules = platformRules.instagram;
  const prompt = `Write one Instagram caption (max ${rules.targetChars} characters, ${rules.minHashtags}-${rules.maxHashtags} hashtags) using ONLY these facts:
Title: ${item.title}
Description: ${item.description}
Do not invent any prices, clients or claims. End with a call to action.`;
  const { text, model } = await generate(prompt);
  console.log(model, "\n", text);
}
main().catch((e) => console.error("Failed:", e.message));