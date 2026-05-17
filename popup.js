// popup.js for Kromo-AI Extension

document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const saveBtn = document.getElementById('saveBtn');
    const loginBtn = document.getElementById('loginBtn');
    const statusDiv = document.getElementById('status');
    const profileCard = document.getElementById('profileCard');
    const profileName = document.getElementById('profileName');
    const profilePic = document.getElementById('profilePic');

    // Load existing settings and profile
    chrome.storage.local.get(['kromo_api_key', 'kromo_user_name', 'kromo_user_pic'], (result) => {
        if (result.kromo_api_key) {
            apiKeyInput.value = result.kromo_api_key;
        }
        if (result.kromo_user_name) {
            showProfile(result.kromo_user_name, result.kromo_user_pic);
        }
    });

    function showProfile(name, picUrl) {
        profileName.textContent = name;
        if (picUrl) {
            profilePic.innerHTML = `<img src="${picUrl}" alt="Profile">`;
        }
        profileCard.style.display = 'flex';
        loginBtn.style.display = 'none';
    }

    function showStatus(msg, isError=false) {
        statusDiv.textContent = msg;
        statusDiv.style.color = isError ? '#D85A30' : '#1D9E75';
        setTimeout(() => { statusDiv.textContent = ''; }, 3000);
    }

    // Save API key
    saveBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        chrome.storage.local.set({ kromo_api_key: apiKey }, () => {
            showStatus('✅ Settings saved!');
        });
    });

    // Login with Google
    loginBtn.addEventListener('click', () => {
        showStatus('Authenticating...');
        
        const manifest = chrome.runtime.getManifest();
        const clientId = (manifest.oauth2 && manifest.oauth2.client_id) ? manifest.oauth2.client_id : "";
        
        // Bypassing real OAuth to prevent Chrome Extension error page if Client ID is dummy
        if (clientId.includes("MASUKKAN") || clientId.includes("YOUR_")) {
            showStatus('Membuat profil simulasi...', false);
            setTimeout(() => {
                const mockName = "Hanii";
                const mockPic = "https://ui-avatars.com/api/?name=Hanii&background=e1f5ee&color=085041&bold=true";
                chrome.storage.local.set({ 
                    kromo_user_name: mockName,
                    kromo_user_pic: mockPic
                }, () => {
                    showProfile(mockName, mockPic);
                    showStatus('✅ Login Simulasi Berhasil!');
                });
            }, 1000);
            return;
        }

        chrome.identity.getAuthToken({ interactive: true }, function(token) {
            if (chrome.runtime.lastError) {
                const err = chrome.runtime.lastError.message;
                showStatus(`Login failed: ${err}`, true);
                return;
            }

            // Fetch user profile using the token
            fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token)
            .then(response => response.json())
            .then(data => {
                const name = data.name || data.given_name || 'User';
                const pic = data.picture || '';
                
                // Save to local storage
                chrome.storage.local.set({ 
                    kromo_user_name: name,
                    kromo_user_pic: pic
                }, () => {
                    showProfile(name, pic);
                    showStatus('✅ Berhasil Login!');
                });
            })
            .catch(error => {
                showStatus('Gagal mengambil profil', true);
            });
        });
    });
});
