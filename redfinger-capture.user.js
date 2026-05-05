// ==UserScript==
// @name         Redfinger Auto Capture
// @namespace    https://dazai-ux.github.io
// @version      1.5
// @description  Show credentials for easy copy-paste
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
        btn.innerHTML = '🚀 SEND CREDENTIALS TO AUTO SERVICE';
        btn.style.cssText = `
            position: fixed; bottom: 25px; right: 25px; z-index: 9999999;
            padding: 16px 24px; background: linear-gradient(90deg, #3b82f6, #60a5fa);
            color: white; border: none; border-radius: 50px; font-size: 16px; font-weight: bold;
            box-shadow: 0 8px 25px rgba(59,130,246,0.5); cursor: pointer;
        `;

        btn.onclick = showCredentials;
        document.body.appendChild(btn);
    }

    function showCredentials() {
        let userId = "Not Found";
        let sessionId = "Not Found";
        let uuid = "Not Found";

        // Capture Authorization
        const elements = document.querySelectorAll('*');
        for (let el of elements) {
            const auth = el.getAttribute('authorization') || el.getAttribute('Authorization');
            if (auth) {
                const parts = auth.trim().split(/\s+/);
                if (parts.length >= 2) {
                    userId = parts[0];
                    sessionId = parts[1];
                    break;
                }
            }
        }

        uuid = localStorage.getItem('uuid') || localStorage.getItem('deviceId') || "Please get manually";

        const text = `🔑 Redfinger Credentials\n\n` +
                    `User ID     : ${userId}\n` +
                    `Session ID  : ${sessionId}\n` +
                    `UUID        : ${uuid}\n\n` +
                    `Copy everything above and paste on my website.`;

        GM_setClipboard(text);
        
        alert(`✅ Credentials Captured!\n\n` +
              `User ID : ${userId}\n` +
              `Session ID : ${sessionId}\n` +
              `UUID : ${uuid}\n\n` +
              `✅ Copied to clipboard!\n\nPaste them on my website order form.`);
    }

    setTimeout(createButton, 3000);
})();
