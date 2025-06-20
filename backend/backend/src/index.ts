import express, { Request, Response } from 'express';
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
import geminiRouter from './routes/gemini';

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
app.get('/api/health', (_: Request, res: Response): void => {
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
app.get('/api/protected-route', ClerkExpressRequireAuth(), async (req: Request, res: Response): Promise<void> => {
  const { auth } = req as RequireAuthProp<typeof req>;
  if (!auth?.userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  res.json({ message: 'Access granted', userId: auth.userId });
});

// Gemini route (inline fallback if needed)
app.post('/api/gemini', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({
        error: 'Invalid request',
        details: 'Prompt must be a non-empty string'
      });
      return;
    }

    console.log(`Using Gemini model: ${CURRENT_GEMINI_MODEL}`);
    const model = genAI.getGenerativeModel({ model: CURRENT_GEMINI_MODEL });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      result: text
    });
  } catch (error: any) {
    console.error('Gemini API Error:', {
      message: error.message,
      stack: error.stack,
      ...(error.response?.data ? { apiResponse: error.response.data } : {})
    });
    res.status(500).json({
      error: 'Failed to generate content',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      model: CURRENT_GEMINI_MODEL
    });
  }
});

// Or optionally mount separate Gemini route
// app.use("/api/gemini", geminiRouter);

export default app;
