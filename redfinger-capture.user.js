// ==UserScript==
// @name         Redfinger Auto Capture
// @namespace    https://dazai-ux.github.io
// @version      1.2
// @description  Capture Redfinger credentials easily
// @author       Redfinger Auto
// @match        https://www.cloudemulator.net/*
// @grant        GM_setClipboard
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    console.log('%c✅ Redfinger Auto Capture Loaded', 'color: #3b82f6; font-size: 14px; font-weight: bold');

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

        btn.onclick = captureCredentials;
        document.body.appendChild(btn);
    }

    function captureCredentials() {
        let userId = "Not Found";
        let sessionId = "Not Found";
        let uuid = "Not Found";

        // Try to find Authorization
        const allElements = document.querySelectorAll('*');
        for (let el of allElements) {
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
        uuid = localStorage.getItem('uuid') || 
               localStorage.getItem('deviceId') || 
               localStorage.getItem('UUID') || "Manual UUID needed";

        const customer = prompt("Enter your name:", "dazai") || "Customer";
        const days = prompt("How many days do you want?", "2000") || "2000";

        const text = `🔑 Redfinger Credentials for Auto Service\n\n` +
                    `👤 Customer: ${customer}\n` +
                    `📅 Days: ${days}\n\n` +
                    `User ID: ${userId}\n` +
                    `Session ID: ${sessionId}\n` +
                    `UUID: ${uuid}\n\n` +
                    `Sent from Redfinger Auto Capture`;

        GM_setClipboard(text);
        alert("✅ Credentials copied to clipboard!\n\nNow go back to my website and paste them in the order form.");
    }

    // Start the script
    setTimeout(createButton, 3000);
})();
