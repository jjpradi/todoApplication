const express = require("express");
const axios = require("axios");
require('dotenv').config()

const {GoogleGenAI} = require('@google/genai')

const router = express.Router();

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})
router.post("/analyze", async (req, res) => {
  

  // 🔵 1. Try Hugging Face
  try {

    console.log(req.body)
    const todo = req.body.task
    console.log(todo)
    const result = await genAI.models.generateContent({
      model: 'models/gemini-pro', // recommended
      contents: `
      
       
      "priority":"","status":"",
       "improvise version":"",
       "sugesstion":""

${todo}
  `,
    })
const reply=result.text
    return res.json({
      reply
    });
    

  } catch (hfError) {
    console.log(hfError)
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