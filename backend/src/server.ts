import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  ClerkExpressWithAuth,
  ClerkExpressRequireAuth,
  RequireAuthProp,
} from "@clerk/clerk-sdk-node";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// Validate required env variables
if (!process.env.GEMINI_API_KEY || !process.env.CLERK_SECRET_KEY) {
  console.error("❌ Missing required environment variables (GEMINI_API_KEY or CLERK_SECRET_KEY)");
  process.exit(1);
}

// Initialize Gemini AI with Flash model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Middleware
app.use(cors());
app.use(express.json());
app.use(ClerkExpressWithAuth({}));

// ✅ Health check route
app.get("/api/health", (_, res) => {
  res.json({ status: "Backend is alive 🚀" });
});

// Authenticated test route
app.get(
  "/api/protected-route",
  ClerkExpressRequireAuth(),
  (req, res) => {
    const { auth } = req as RequireAuthProp<typeof req>;
    if (!auth?.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    res.json({ message: "Access granted", userId: auth.userId });
  }
);

// Gemini prompt route
app.post("/api/gemini", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Prompt must be a non-empty string." });
      return;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text?.() || "No response from Gemini.";
    res.json({ result: text });
  } catch (error: any) {
    console.error("❌ Gemini API Error:", error.message || error);
    if (error?.message?.includes("no text in response")) {
      res.status(500).json({ error: "Gemini returned an empty response." });
      return;
    }
    if (error.code === "ECONNREFUSED") {
      res.status(500).json({ error: "Failed to connect to Gemini API." });
      return;
    }
    res.status(500).json({ error: "Internal server error from Gemini API." });
  }
});

// ✅ Only listen when executed directly (important for some environments like testing or bundlers)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Backend running at http://localhost:${PORT}`);
  });
}

export default app;
