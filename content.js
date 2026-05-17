// content.js for Kromo-AI Extension

console.log("🌿 Kromo-AI Digital Guardian: Content script loaded.");

let typingTimer;
const doneTypingInterval = 1000; // 1 second
let lastAnalyzedText = "";
let kromoContainer = null;

// Platform detection
const isTikTok = window.location.hostname.includes("tiktok.com");
const isInstagram = window.location.hostname.includes("instagram.com");
const platform = isTikTok ? "TikTok" : (isInstagram ? "Instagram" : "Unknown");

// Create Floating UI
function injectUI() {
    if (document.getElementById('kromo-ai-floating-container')) return;

    kromoContainer = document.createElement('div');
    kromoContainer.id = 'kromo-ai-floating-container';

    kromoContainer.innerHTML = `
        <div id="kromo-ai-card">
            <div id="kromo-ai-header">
                <h3 id="kromo-ai-header-title">Kromo<span>-AI</span></h3>
                <button id="kromo-ai-close">×</button>
            </div>
            <div id="kromo-ai-body">
                <!-- Content will be injected here -->
            </div>
        </div>
    `;

    document.body.appendChild(kromoContainer);

    document.getElementById('kromo-ai-close').addEventListener('click', () => {
        hideUI();
    });
}

function showUI(data) {
    injectUI();
    const body = document.getElementById('kromo-ai-body');
    const container = document.getElementById('kromo-ai-floating-container');

    const levelClass = data.level === 'harmful' ? 'harmful' : 'caution';
    const icon = data.level === 'harmful' ? '🚫' : '⚠️';
    const title = data.level === 'harmful' ? 'Peringatan! Konten Berbahaya' : 'Hati-hati! Perlu Dipertimbangkan';

    let html = `
        <div class="kromo-popup-warning ${levelClass} kromo-shake">
            <div class="kromo-header-status ${levelClass}">${icon} ${title}</div>
            <div class="kromo-meta">Platform: ${platform} &middot; Emosi: <b>${data.emotion || 'Unknown'}</b></div>
    `;

    if (data.problem) {
        html += `<div class="kromo-section kromo-problem ${levelClass}">❌ <b>Masalah:</b> ${data.problem}</div>`;
    }
    if (data.nudge) {
        html += `<div class="kromo-section kromo-problem ${levelClass}">💭 ${data.nudge}</div>`;
    }
    if (data.wisdom) {
        html += `<div class="kromo-section kromo-wisdom">🌺 "${data.wisdom}"</div>`;
    }
    if (data.alternative) {
        html += `
            <div class="kromo-section kromo-solution">
                <div class="kromo-solution-label">✅ Coba gunakan versi ini:</div>
                ${data.alternative}
            </div>
        `;
    }

    html += `</div>`;
    body.innerHTML = html;

    container.classList.add('show');
}

function hideUI() {
    if (kromoContainer) {
        kromoContainer.classList.remove('show');
    }
}

// Analyze text
async function analyzeText(text) {
    if (!text || text.trim().length < 3) return;
    if (text === lastAnalyzedText) return;

    lastAnalyzedText = text;

    // Get API Key and User Name from storage
    chrome.storage.local.get(['kromo_api_key', 'kromo_user_name'], async function (result) {
        const apiKey = result.kromo_api_key || "";
        const userName = result.kromo_user_name || null;

        try {
            console.log("🌿 Kromo-AI: Analyzing text...", text);
            // URL Backend (Railway)
            const WORKER_URL = "https://kromo-ai-production.up.railway.app/api/analyze";

            const response = await fetch(WORKER_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text: text,
                    api_key: apiKey,
                    platform: platform,
                    user_name: userName
                })
            });

            if (!response.ok) {
                console.error("Kromo-AI Backend Error", response.statusText);
                return;
            }

            const data = await response.json();
            console.log("🌿 Kromo-AI Result:", data);

            if (data.level === 'caution' || data.level === 'harmful') {
                showUI(data);
            } else {
                hideUI();
            }

        } catch (err) {
            console.error("Kromo-AI Error connecting to backend:", err);
        }
    });
}

// Event Listeners for Input
function setupInputListener() {
    let lastText = "";
    document.addEventListener('keyup', () => {
        const active = document.activeElement;
        if (!active) return;

        let text = "";
        if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') {
            text = active.value;
        } else if (active.isContentEditable || active.closest('[contenteditable]')) {
            const editor = active.isContentEditable ? active : active.closest('[contenteditable]');
            text = editor.innerText || editor.textContent;
        }

        if (text) {
            text = text.trim();
        }

        if (text && text !== lastText) {
            lastText = text;
            clearTimeout(typingTimer);
            console.log("🌿 Kromo-AI mendeteksi ketikan:", text);
            typingTimer = setTimeout(() => {
                analyzeText(text);
            }, doneTypingInterval);
        }
    }, true);
}

// Initialize
setupInputListener();
injectUI();
