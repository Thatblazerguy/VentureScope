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

const BASE_SYSTEM_PROMPT = `You are the OpenClaw Venture Copilot — a sharp, concise AI assistant embedded inside VentureScope, an autonomous market intelligence platform.

Your role is to help the user understand their tracked domains, interpret gap scores, and identify venture opportunities.

Rules:
- ALWAYS keep answers extremely concise: 2-4 sentences max.
- Reference the user's specific domains and scores when relevant.
- Never use generic advice — always tie it back to their actual SOUL context provided below.
- Use numbers and data points from the context when available.
- Avoid filler phrases like "Great question!" or "Certainly!".
- If asked something unrelated to venture intelligence, politely redirect.`;

app.post('/chat', async (req, res) => {
  const { message, soulContext } = req.body;

  if (!process.env.LLM_API_KEY) {
    return res.status(500).send("OpenClaw LLM_API_KEY is missing.");
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  // Build personalized system instruction
  const systemInstruction = soulContext
    ? `${BASE_SYSTEM_PROMPT}\n\n${soulContext}`
    : BASE_SYSTEM_PROMPT;

  try {
    let responseStream;
    let attempts = 0;
    while (attempts < 3) {
      try {
        responseStream = await ai.models.generateContentStream({
          model: model,
          contents: message,
          config: {
            systemInstruction,
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
    const status = error.status || 0;
    let friendlyMsg;
    if (status === 429) {
      friendlyMsg = "⚠️ OpenClaw has hit the Gemini API daily quota limit. Please wait until midnight (Pacific Time) for the quota to reset, or add a billing account at aistudio.google.com.";
    } else if (status === 503) {
      friendlyMsg = "⚠️ Gemini is temporarily overloaded. Please try again in a few seconds.";
    } else {
      friendlyMsg = "⚠️ OpenClaw Copilot failed to generate a response. Please try again.";
    }
    res.write(friendlyMsg);
    res.end();
  }
});

app.listen(port, () => {
  console.log(`🚀 OpenClaw Agent Runtime is listening on port ${port}`);
});
