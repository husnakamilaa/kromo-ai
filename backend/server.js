// server.js — Kromo-AI Backend Server
import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { analyzeWithGemini } from "./services/gemini.js";
import { analyzeWithFallback } from "./services/fallback.js";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.json({
        status: "ok",
        service: "Kromo-AI Backend",
        version: "1.0.0",
    });
});

// Main analysis endpoint
app.post("/api/analyze", async (req, res) => {
    try {
        const { text, api_key, platform, user_name } = req.body;

        // Validate input
        if (!text || text.trim().length < 3) {
            return res.status(400).json({
                error: "Text is required and must be at least 3 characters",
            });
        }

        console.log(`🌿 Analyzing: "${text.substring(0, 50)}..." | Platform: ${platform} | User: ${user_name || "Anonymous"}`);

        // Analyze with Gemini AI (fallback to local keywords if Gemini fails)
        let result;
        try {
            result = await analyzeWithGemini(
                text.trim(),
                platform || "Unknown",
                user_name,
                api_key || null
            );
            console.log("🤖 Analyzed via Gemini AI");
        } catch (geminiErr) {
            console.warn("⚠️ Gemini failed, using fallback:", geminiErr.message.substring(0, 80));
            result = analyzeWithFallback(text.trim(), platform, user_name);
            console.log("🔄 Analyzed via local fallback");
        }

        // Find or create user (if user_name provided)
        let userId = null;
        if (user_name) {
            try {
                let user = await prisma.user.findFirst({
                    where: { name: user_name },
                });
                if (!user) {
                    user = await prisma.user.create({
                        data: { name: user_name },
                    });
                }
                userId = user.id;
            } catch (dbErr) {
                console.warn("⚠️ User DB operation failed (non-fatal):", dbErr.message);
            }
        }

        // Log analysis to database
        try {
            await prisma.analysisLog.create({
                data: {
                    userId,
                    platform: platform || "Unknown",
                    inputText: text.trim(),
                    level: result.level,
                    emotion: result.emotion,
                    problem: result.problem,
                    nudge: result.nudge,
                    wisdom: result.wisdom,
                    alternative: result.alternative,
                },
            });
            console.log(`✅ Logged: level=${result.level}, emotion=${result.emotion}`);
        } catch (dbErr) {
            console.warn("⚠️ Log DB operation failed (non-fatal):", dbErr.message);
        }

        // Return result to extension
        res.json(result);

    } catch (error) {
        console.error("❌ Unexpected error:", error.message);
        // Last resort fallback
        const fallbackResult = analyzeWithFallback(req.body.text || "", req.body.platform, req.body.user_name);
        res.json(fallbackResult);
    }
});

// Get analysis history
app.get("/api/logs", async (req, res) => {
    try {
        const logs = await prisma.analysisLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 50,
            include: { user: true },
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Graceful shutdown
process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`🌿 Kromo-AI Backend running at http://localhost:${PORT}`);
    console.log(`📡 POST /api/analyze — Analyze comment sentiment`);
    console.log(`📋 GET  /api/logs    — View analysis history`);
});
