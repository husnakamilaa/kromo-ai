// main.js — Kromo-AI Popup Logic
import "./style.css";

document.addEventListener("DOMContentLoaded", () => {
    const apiKeyInput = document.getElementById("apiKey");
    const saveBtn = document.getElementById("saveBtn");
    const loginBtn = document.getElementById("loginBtn");
    const statusDiv = document.getElementById("status");
    const profileCard = document.getElementById("profileCard");
    const profileName = document.getElementById("profileName");
    const profilePic = document.getElementById("profilePic");
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");
    const toggleKey = document.getElementById("toggleKey");
    const eyeIcon = document.getElementById("eyeIcon");
    const statsCard = document.getElementById("statsCard");

    // ===== Theme Management =====
    function getStoredTheme() {
        try {
            return (typeof chrome !== "undefined" && chrome.storage)
                ? null // will be loaded async
                : localStorage.getItem("kromo_theme");
        } catch {
            return null;
        }
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        applyTheme(next);
        // Save preference
        try {
            if (typeof chrome !== "undefined" && chrome.storage) {
                chrome.storage.local.set({ kromo_theme: next });
            } else {
                localStorage.setItem("kromo_theme", next);
            }
        } catch { /* ignore */ }
    }

    // Load theme
    try {
        if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.local.get(["kromo_theme"], (result) => {
                applyTheme(result.kromo_theme || "light");
            });
        } else {
            applyTheme(localStorage.getItem("kromo_theme") || "light");
        }
    } catch {
        applyTheme("light");
    }

    themeToggle.addEventListener("click", toggleTheme);

    // ===== API Key Visibility Toggle =====
    let keyVisible = false;
    toggleKey.addEventListener("click", () => {
        keyVisible = !keyVisible;
        apiKeyInput.type = keyVisible ? "text" : "password";
        eyeIcon.textContent = keyVisible ? "🙈" : "👁";
    });

    // ===== Show Profile =====
    function showProfile(name, picUrl) {
        profileName.textContent = name;
        if (picUrl) {
            profilePic.innerHTML = `<img src="${picUrl}" alt="${name}">`;
        }
        profileCard.style.display = "flex";
        loginBtn.style.display = "none";
        statsCard.style.display = "block";
    }

    // ===== Status Messages =====
    function showStatus(msg, isError = false) {
        statusDiv.textContent = msg;
        statusDiv.className = `status-message ${isError ? "error" : "success"}`;
        setTimeout(() => {
            statusDiv.textContent = "";
            statusDiv.className = "status-message";
        }, 3000);
    }

    // ===== Load Existing Settings =====
    try {
        if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.local.get(
                ["kromo_api_key", "kromo_user_name", "kromo_user_pic"],
                (result) => {
                    if (result.kromo_api_key) {
                        apiKeyInput.value = result.kromo_api_key;
                    }
                    if (result.kromo_user_name) {
                        showProfile(result.kromo_user_name, result.kromo_user_pic);
                    }
                }
            );
        }
    } catch { /* not in extension context */ }

    // ===== Save API Key =====
    saveBtn.addEventListener("click", () => {
        const apiKey = apiKeyInput.value.trim();
        try {
            if (typeof chrome !== "undefined" && chrome.storage) {
                chrome.storage.local.set({ kromo_api_key: apiKey }, () => {
                    showStatus("✅ Pengaturan tersimpan!");
                });
            } else {
                localStorage.setItem("kromo_api_key", apiKey);
                showStatus("✅ Pengaturan tersimpan!");
            }
        } catch {
            showStatus("❌ Gagal menyimpan", true);
        }
    });

    // ===== Google Login =====
    loginBtn.addEventListener("click", () => {
        showStatus("Memproses login...");

        try {
            if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getManifest) {
                const manifest = chrome.runtime.getManifest();
                const clientId = manifest.oauth2?.client_id || "";

                // If dummy Client ID, use simulation
                if (
                    clientId.includes("1234567890") ||
                    clientId.includes("MASUKKAN") ||
                    clientId.includes("YOUR_")
                ) {
                    simulateLogin();
                    return;
                }

                // Real OAuth
                chrome.identity.getAuthToken({ interactive: true }, (token) => {
                    if (chrome.runtime.lastError) {
                        showStatus(`Login gagal: ${chrome.runtime.lastError.message}`, true);
                        return;
                    }
                    fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" + token)
                        .then((r) => r.json())
                        .then((data) => {
                            const name = data.name || data.given_name || "User";
                            const pic = data.picture || "";
                            chrome.storage.local.set(
                                { kromo_user_name: name, kromo_user_pic: pic },
                                () => {
                                    showProfile(name, pic);
                                    showStatus("✅ Berhasil Login!");
                                }
                            );
                        })
                        .catch(() => showStatus("Gagal mengambil profil", true));
                });
            } else {
                simulateLogin();
            }
        } catch {
            simulateLogin();
        }
    });

    function simulateLogin() {
        setTimeout(() => {
            const mockName = "Hanii";
            const mockPic = "https://ui-avatars.com/api/?name=Hanii&background=0a6b52&color=5DCAA5&bold=true&size=80";
            try {
                if (typeof chrome !== "undefined" && chrome.storage) {
                    chrome.storage.local.set(
                        { kromo_user_name: mockName, kromo_user_pic: mockPic },
                        () => {
                            showProfile(mockName, mockPic);
                            showStatus("✅ Login Simulasi Berhasil!");
                        }
                    );
                } else {
                    showProfile(mockName, mockPic);
                    showStatus("✅ Login Simulasi Berhasil!");
                }
            } catch {
                showProfile(mockName, mockPic);
                showStatus("✅ Login Simulasi Berhasil!");
            }
        }, 800);
    }
});
