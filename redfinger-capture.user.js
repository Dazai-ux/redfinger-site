// ==UserScript==
// @name         Redfinger Auto Capture
// @namespace    https://dazai-ux.github.io
// @version      1.8
// @description  Simple copy credentials
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
            position: fixed; bottom: 30px; right: 30px; z-index: 99999999;
            padding: 18px 28px; background: #3b82f6; color: white;
            border: none; border-radius: 50px; font-size: 17px; font-weight: bold;
            box-shadow: 0 10px 30px rgba(59,130,246,0.6); cursor: pointer;
        `;

        btn.onclick = captureAndShow;
        document.body.appendChild(btn);
    }

    function captureAndShow() {
        let userId = "Not Found";
        let sessionId = "Not Found";
        let uuid = "Not Found";

        // Capture Authorization
        document.querySelectorAll('*').forEach(el => {
            const auth = el.getAttribute('authorization') || el.getAttribute('Authorization');
            if (auth) {
                const parts = auth.trim().split(/\s+/);
                if (parts.length >= 2) {
                    userId = parts[0];
                    sessionId = parts[1];
                }
            }
        });

        uuid = localStorage.getItem('uuid') || localStorage.getItem('deviceId') || "Get manually";

        const text = `User ID: ${userId}\nSession ID: ${sessionId}\nUUID: ${uuid}`;

        GM_setClipboard(text);

        // Simple alert (most reliable)
        alert(`✅ Captured & Copied!\n\n` +
              `User ID     : ${userId}\n` +
              `Session ID  : ${sessionId}\n` +
              `UUID        : ${uuid}\n\n` +
              `✅ Now go back to the website and paste these values.`);
    }

    // Run after page loads
    setTimeout(createButton, 3000);
})();
