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
const dotenv_1 = __importDefault(require("dotenv"));
const generative_ai_1 = require("@google/generative-ai");
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
dotenv_1.default.config();
const app = (0, express_1.default)();
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
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, clerk_sdk_node_1.ClerkExpressWithAuth)({}));
// ✅ Health check route
app.get("/api/health", (_, res) => {
    res.json({ status: "Backend is alive 🚀" });
});
// Authenticated test route
app.get("/api/protected-route", (0, clerk_sdk_node_1.ClerkExpressRequireAuth)(), (req, res) => {
    const { auth } = req;
    if (!(auth === null || auth === void 0 ? void 0 : auth.userId)) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    res.json({ message: "Access granted", userId: auth.userId });
});
// Gemini prompt route
app.post("/api/gemini", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { prompt } = req.body;
        if (!prompt || typeof prompt !== "string") {
            res.status(400).json({ error: "Prompt must be a non-empty string." });
            return;
        }
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = yield model.generateContent(prompt);
        const text = ((_b = (_a = result.response).text) === null || _b === void 0 ? void 0 : _b.call(_a)) || "No response from Gemini.";
        res.json({ result: text });
    }
    catch (error) {
        console.error("❌ Gemini API Error:", error.message || error);
        if ((_c = error === null || error === void 0 ? void 0 : error.message) === null || _c === void 0 ? void 0 : _c.includes("no text in response")) {
            res.status(500).json({ error: "Gemini returned an empty response." });
            return;
        }
        if (error.code === "ECONNREFUSED") {
            res.status(500).json({ error: "Failed to connect to Gemini API." });
            return;
        }
        res.status(500).json({ error: "Internal server error from Gemini API." });
    }
}));
// ✅ Only listen when executed directly (important for some environments like testing or bundlers)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Backend running at http://localhost:${PORT}`);
    });
}
exports.default = app;
