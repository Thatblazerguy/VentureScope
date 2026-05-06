const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.LLM_API_KEY });

async function test(modelName) {
  try {
    const res = await ai.models.generateContent({
      model: modelName,
      contents: "hello",
    });
    console.log(modelName, "SUCCESS");
  } catch (e) {
    console.log(modelName, "FAILED", e.status);
  }
}

async function run() {
  await test('gemini-1.5-flash');
  await test('gemini-2.5-flash');
  await test('gemini-2.0-flash');
  await test('gemini-1.5-pro');
}

run();
