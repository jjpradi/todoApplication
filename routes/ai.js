const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/analyze", async (req, res) => {
  const { todo } = req.body;

  const prompt = `
Analyze this todo and respond in this JSON format:
{
  "improved_version": "",
  "priority": "Low | Medium | High",
  "category": ""
}

Todo: ${todo}
`;

  // 🔵 1. Try Hugging Face
  try {
    const hfResponse = await axios.post(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`
        }
      }
    );

    return res.json({
      source: "huggingface",
      result: hfResponse.data[0].generated_text
    });
    

  } catch (hfError) {
    console.log("HF failed, switching to Ollama...");
  }

  // 🟢 2. Fallback to Ollama
  try {
    const ollamaResponse = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3",
        prompt: prompt,
        stream: false
      }
    );

    raw = ollamaResponse.data.response;
    
  
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));

    res.json(parsed);

  } catch (ollamaError) {
    console.error("Both AI providers failed");

    return res.status(500).json({
      message: "AI service unavailable"
    });
  }
});

module.exports = router;