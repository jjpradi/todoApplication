const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/analyze", async (req, res) => {
  try {
    const { task } = req.body;

    const prompt = `
You are an AI task analyzer.

Analyze this todo task: "${task}"

Return strictly in this JSON format:

{
  "category": "",
  "priority": "",
  "suggested_deadline": "",
  "summary": ""
}

Return ONLY valid JSON.
`;

    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3",
      prompt: prompt,
      stream: false
    });

    const raw = response.data.response;

    // Extract JSON safely
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    const cleanJson = raw.slice(jsonStart, jsonEnd + 1);

    const parsed = JSON.parse(cleanJson);

    res.json(parsed);

  } catch (err) {
    console.error("OLLAMA ERROR:", err.message);
    res.status(500).json({ error: "AI analysis failed" });
  }
});

module.exports = router;