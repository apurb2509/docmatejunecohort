"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const supabase_js_1 = require("@supabase/supabase-js");
const generative_ai_1 = require("@google/generative-ai");
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
dotenv_1.default.config();
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
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const CURRENT_GEMINI_MODEL = 'gemini-1.5-flash';
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use((0, clerk_sdk_node_1.ClerkExpressWithAuth)({}));
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// Health check
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
app.get('/api/protected-route', (0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { auth } = req;
    if (!(auth === null || auth === void 0 ? void 0 : auth.userId)) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    res.json({ message: 'Access granted', userId: auth.userId });
}));
// Gemini inline route
app.post('/api/gemini', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        const result = yield model.generateContent(prompt);
        const response = yield result.response;
        const text = response.text();
        res.json({
            success: true,
            result: text
        });
    }
    catch (error) {
        console.error('Gemini API Error:', Object.assign({ message: error.message, stack: error.stack }, (((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) ? { apiResponse: error.response.data } : {})));
        res.status(500).json({
            error: 'Failed to generate content',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            model: CURRENT_GEMINI_MODEL
        });
    }
}));
// Optional separate Gemini router
// app.use('/api/gemini', geminiRouter);
// Start server
app.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);
});
