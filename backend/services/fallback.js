// services/fallback.js — Local Keyword-Based Fallback Analyzer
// Digunakan ketika Gemini AI tidak tersedia (quota habis, key invalid, dll)

const HARMFUL_WORDS = [
    "bodoh", "goblok", "tolol", "idiot", "bego", "dungu",
    "jelek", "buruk rupa", "burem", "norak",
    "anjing", "bangsat", "bajingan", "brengsek", "kampret", "tai",
    "mati", "bunuh", "hancur",
    "gendut", "kerempeng", "pesek", "buluk", "dekil",
    "sampah", "busuk", "najis", "jijik",
    "rasis", "kafir", "cina", "pribumi",
];

const CAUTION_WORDS = [
    "sombong", "lebay", "alay", "sok", "pamer",
    "gak guna", "gk guna", "ga guna", "nggak guna",
    "malu", "mending", "kasian", "parah",
    "cringe", "eww", "males",
    "gak bisa", "payah", "lemah",
];

const WISDOM_QUOTES = [
    "Mulutmu harimaumu — kata-kata bisa menyakiti lebih dalam dari pedang.",
    "Aja rumangsa bisa, nanging bisaa rumangsa — Jangan merasa hebat, tapi biasakanlah merasakan.",
    "Desa mawa cara, negara mawa tata — Setiap tempat punya aturan dan tata krama.",
    "Wong sabar rejekine jembar — Orang yang sabar rezekinya luas.",
    "Yen ora nandur, aja ngarep panen — Kalau tidak menanam kebaikan, jangan harap menuai hasil baik.",
    "Ajining dhiri saka lathi — Harga diri seseorang terlihat dari ucapannya.",
];

/**
 * Analyze text using local keyword matching (fallback when Gemini unavailable)
 */
export function analyzeWithFallback(text, platform, userName) {
    const lowerText = text.toLowerCase();

    // Check harmful words
    const foundHarmful = HARMFUL_WORDS.filter(w => lowerText.includes(w));
    if (foundHarmful.length > 0) {
        const randomWisdom = WISDOM_QUOTES[Math.floor(Math.random() * WISDOM_QUOTES.length)];
        return {
            level: "harmful",
            emotion: "Negatif",
            problem: `Komentar mengandung kata yang tidak pantas: "${foundHarmful[0]}"`,
            nudge: "Coba bayangkan jika kamu yang membaca komentar ini. Bagaimana perasaanmu?",
            wisdom: randomWisdom,
            alternative: "Coba sampaikan pendapatmu dengan cara yang lebih sopan dan konstruktif.",
            _fallback: true,
        };
    }

    // Check caution words
    const foundCaution = CAUTION_WORDS.filter(w => lowerText.includes(w));
    if (foundCaution.length > 0) {
        const randomWisdom = WISDOM_QUOTES[Math.floor(Math.random() * WISDOM_QUOTES.length)];
        return {
            level: "caution",
            emotion: "Kurang Sopan",
            problem: `Komentar berpotensi menyinggung: "${foundCaution[0]}"`,
            nudge: "Apakah kamu yakin ingin mengirim komentar ini? Coba baca ulang sebelum posting.",
            wisdom: randomWisdom,
            alternative: "Pertimbangkan untuk menyampaikan dengan nada yang lebih positif.",
            _fallback: true,
        };
    }

    // Safe
    return {
        level: "safe",
        emotion: "Netral",
        problem: "",
        nudge: "",
        wisdom: "",
        alternative: "",
        _fallback: true,
    };
}
