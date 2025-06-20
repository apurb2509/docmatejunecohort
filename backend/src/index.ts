import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  ClerkExpressWithAuth,
  ClerkExpressRequireAuth,
  RequireAuthProp,
} from '@clerk/clerk-sdk-node';

dotenv.config();

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

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const CURRENT_GEMINI_MODEL = 'gemini-1.5-flash';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(ClerkExpressWithAuth({}));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/api/health', (_, res) => {
  res.json({
    status: 'healthy',
    services: {
      supabase: !!supabase,
      gemini: !!genAI,
      model: CURRENT_GEMINI_MODEL
    }
  });
});

// Protected route
app.get('/api/protected-route', ClerkExpressRequireAuth(), (req, res) => {
  const { auth } = req as RequireAuthProp<typeof req>;
  if (!auth?.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({ message: 'Access granted', userId: auth.userId });
});

// Gemini route
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

export default app;
