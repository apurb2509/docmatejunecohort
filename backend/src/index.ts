import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config();

// Validate environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
  'CLERK_SECRET_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing ${envVar} in environment variables`);
    process.exit(1);
  }
}

// Initialize services
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const CURRENT_GEMINI_MODEL = 'gemini-1.5-flash'; // Updated to flash

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Enhanced logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    services: {
      supabase: !!supabase,
      gemini: !!genAI,
      model: CURRENT_GEMINI_MODEL
    }
  });
});

// Gemini API endpoint
app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request',
        details: 'Prompt must be a non-empty string'
      });
    }

    console.log(`Using Gemini model: ${CURRENT_GEMINI_MODEL}`);
    const model = genAI.getGenerativeModel({ model: CURRENT_GEMINI_MODEL });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.json({ 
      success: true,
      result: text 
    });
  } catch (error: any) {
    console.error('Gemini API Error:', {
      message: error.message,
      stack: error.stack,
      ...(error.response?.data ? { apiResponse: error.response.data } : {})
    });
    return res.status(500).json({
      error: 'Failed to generate content',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      model: CURRENT_GEMINI_MODEL
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔑 Gemini Model: ${CURRENT_GEMINI_MODEL}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});