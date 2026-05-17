// services/gemini.js — Gemini AI Sentiment Analysis Service
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Analyze text sentiment using Gemini AI
 * @param {string} text - Text to analyze
 * @param {string} platform - "TikTok" or "Instagram"
 * @param {string|null} userName - User name
 * @param {string|null} clientApiKey - Optional API key from client
 * @returns {object} Analysis result with level, emotion, problem, nudge, wisdom, alternative
 */
export async function analyzeWithGemini(text, platform, userName, clientApiKey) {
    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("No Gemini API key provided");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
        },
    });

    const prompt = `Kamu adalah Kromo-AI, asisten digital penjaga etika berkomentar di media sosial Indonesia.

Tugasmu: Analisis teks komentar berikut dan tentukan apakah komentar tersebut aman, perlu hati-hati, atau berbahaya.

Berikan respons dalam format JSON dengan field berikut:
{
  "level": "safe" atau "caution" atau "harmful",
  "emotion": "emosi yang terdeteksi (contoh: Marah, Kesal, Sedih, Kecewa, Netral, Senang)",
  "problem": "penjelasan singkat masalah pada teks (string kosong jika safe)",
  "nudge": "dorongan halus untuk user berpikir ulang (string kosong jika safe)",
  "wisdom": "kutipan bijak atau peribahasa Indonesia/Jawa yang relevan (string kosong jika safe)",
  "alternative": "saran komentar alternatif yang lebih sopan dan konstruktif (string kosong jika safe)"
}

Kriteria:
- "safe": Komentar positif, netral, atau konstruktif. Tidak ada masalah.
- "caution": Komentar yang mengandung sindiran halus, sarkasme, nada kurang sopan, atau berpotensi menyinggung.
- "harmful": Komentar yang mengandung ujaran kebencian, body shaming, bullying, SARA, ancaman, kata-kata kasar, atau hinaan.

Platform: ${platform || "Unknown"}
User: ${userName || "Anonymous"}

Teks yang dianalisis:
"${text}"`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);

        // Validate required field
        if (!parsed.level || !["safe", "caution", "harmful"].includes(parsed.level)) {
            parsed.level = "safe";
        }

        return {
            level: parsed.level,
            emotion: parsed.emotion || "Unknown",
            problem: parsed.problem || "",
            nudge: parsed.nudge || "",
            wisdom: parsed.wisdom || "",
            alternative: parsed.alternative || "",
        };
    } catch (error) {
        console.error("Gemini AI Error:", error.message);
        throw error;
    }
}
