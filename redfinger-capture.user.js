// ==UserScript==
// @name         Redfinger Auto Capture
// @namespace    https://dazai-ux.github.io
// @version      1.3
// @description  Send credentials directly
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

        btn.onclick = captureAndSend;
        document.body.appendChild(btn);
    }

    function captureAndSend() {
        let userId = "Not Found";
        let sessionId = "Not Found";
        let uuid = "Not Found";

        // Find Authorization
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

        // Try to get UUID
        uuid = localStorage.getItem('uuid') || localStorage.getItem('deviceId') || "Manual needed";

        const customer = prompt("Your Name:", "dazai") || "Customer";
        const days = prompt("How many days?", "2000") || "2000";
        const vip = prompt("VIP Level (VIP/KVIP/SVIP/XVIP)?", "SVIP") || "SVIP";

        const message = `🔑 Redfinger Credentials\n\n` +
                       `👤 Customer: ${customer}\n` +
                       `📅 Days: ${days}\n` +
                       `⭐ VIP: ${vip}\n\n` +
                       `User ID: ${userId}\n` +
                       `Session ID: ${sessionId}\n` +
                       `UUID: ${uuid}`;

        GM_setClipboard(message);
        
        alert("✅ Credentials copied successfully!\n\n" +
              "Now go back to my website and paste them into the order form.\n\n" +
              "Or just send this message to me on Telegram.");
    }

    setTimeout(createButton, 3000);
})();
