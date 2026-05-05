// ==UserScript==
// @name         Redfinger Auto Capture
// @namespace    https://dazai-ux.github.io
// @version      1.9
// @description  Strong clickable button
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
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            z-index: 2147483647 !important;
            padding: 18px 30px !important;
            background: linear-gradient(90deg, #3b82f6, #1e90ff) !important;
            color: white !important;
            border: none !important;
            border-radius: 50px !important;
            font-size: 17px !important;
            font-weight: bold !important;
            box-shadow: 0 10px 30px rgba(59, 130, 246, 0.8) !important;
            cursor: pointer !important;
            pointer-events: all !important;
            user-select: none !important;
        `;

        btn.onclick = function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            captureAndShow();
        };

        document.body.appendChild(btn);
        console.log("✅ Strong Capture Button Added");
    }

    function captureAndShow() {
        let userId = "Not Found";
        let sessionId = "Not Found";
        let uuid = "Not Found";

        document.querySelectorAll('*').forEach(el => {
            const auth = el.getAttribute('authorization') || el.getAttribute('Authorization');
            if (auth && auth.length > 10) {
                const parts = auth.trim().split(/\s+/);
                if (parts.length >= 2) {
                    userId = parts[0];
                    sessionId = parts[1];
                }
            }
        });

        uuid = localStorage.getItem('uuid') || localStorage.getItem('deviceId') || "Manual";

        const text = `User ID: ${userId}\nSession ID: ${sessionId}\nUUID: ${uuid}`;

        GM_setClipboard(text);

        alert(`✅ SUCCESSFULLY COPIED!\n\n` +
              `User ID     : ${userId}\n` +
              `Session ID  : ${sessionId}\n` +
              `UUID        : ${uuid}\n\n` +
              `Go back to my website and paste these values.`);
    }

    setTimeout(createButton, 2000);
})();
