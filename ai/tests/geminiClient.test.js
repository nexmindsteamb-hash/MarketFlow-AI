process.env.GEMINI_API_KEY = "test-key";
process.env.GEMINI_MODEL = "primary-model";
process.env.GEMINI_FALLBACK_MODEL = "fallback-model";
process.env.GEMINI_MAX_RETRIES = "3";
process.env.GEMINI_RETRY_DELAY_MS = "1";
process.env.GEMINI_TIMEOUT_MS = "1000";

jest.mock("@google/genai", () => {
  const generateContent = jest.fn();
  return {
    GoogleGenAI: jest.fn(() => ({ models: { generateContent } })),
    __generateContent: generateContent,
  };
});

const gen = require("@google/genai").__generateContent;
const { generate, healthCheck } = require("../src/client/geminiClient");

const busy = Object.assign(new Error("busy"), { status: 503 });
const bad = Object.assign(new Error("bad request"), { status: 400 });

beforeEach(() => gen.mockReset());

test("returns text from the primary model", async () => {
  gen.mockResolvedValue({ text: "Hello" });
  const r = await generate("hi");
  expect(r).toEqual({ text: "Hello", model: "primary-model" });
});

test("retries on 503 and then succeeds", async () => {
  gen.mockRejectedValueOnce(busy).mockResolvedValueOnce({ text: "ok" });
  const r = await generate("hi");
  expect(r.text).toBe("ok");
  expect(gen).toHaveBeenCalledTimes(2);
});

test("falls back to the second model when the first keeps failing", async () => {
  gen.mockImplementation(async ({ model }) => {
    if (model === "primary-model") throw busy;
    return { text: "from fallback" };
  });
  const r = await generate("hi");
  expect(r).toEqual({ text: "from fallback", model: "fallback-model" });
});

test("does not retry a 400 error", async () => {
  gen.mockRejectedValue(bad);
  await expect(generate("hi")).rejects.toThrow("bad request");
  expect(gen).toHaveBeenCalledTimes(2); // one call per model, no retries
});

test("healthCheck reports failure instead of throwing", async () => {
  gen.mockRejectedValue(bad);
  const r = await healthCheck();
  expect(r.ok).toBe(false);
});