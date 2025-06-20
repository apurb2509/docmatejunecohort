import express, { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// Initialize Gemini AI with Flash model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Prompt is required." });
      return;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ content: text });
  } catch (err) {
    console.error("❌ Gemini API Error:", err);
    res.status(500).json({ error: "Failed to generate content." });
  }
});

export default router;
