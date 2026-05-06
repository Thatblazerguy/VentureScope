const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: true });

const app = express();
app.use(express.json());

const port = process.env.PORT || 4000;

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.LLM_API_KEY });
const model = process.env.LLM_MODEL || 'gemini-2.5-flash';

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!process.env.LLM_API_KEY) {
    return res.status(500).send("OpenClaw LLM_API_KEY is missing.");
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  try {
    let responseStream;
    let attempts = 0;
    while (attempts < 3) {
      try {
        responseStream = await ai.models.generateContentStream({
          model: model,
          contents: message,
          config: {
            systemInstruction: "You are the OpenClaw Venture Copilot. You MUST keep your responses extremely concise, precise, and short. Never exceed 2-3 sentences. Do not ramble, use lists only if strictly necessary, and avoid conversational filler."
          }
        });
        break; // Success
      } catch (err) {
        attempts++;
        if (err.status === 503 && attempts < 3) {
          console.warn(`[Retry ${attempts}/3] OpenClaw LLM 503 Error. Retrying in 2 seconds...`);
          await new Promise(res => setTimeout(res, 2000));
        } else {
          throw err;
        }
      }
    }

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(chunk.text);
      }
    }
    
    res.end();
  } catch (error) {
    console.error("OpenClaw LLM Error:", error);
    res.write("\n\n[OpenClaw Copilot failed to generate a response.]");
    res.end();
  }
});

app.listen(port, () => {
  console.log(`🚀 OpenClaw Agent Runtime is listening on port ${port}`);
});
