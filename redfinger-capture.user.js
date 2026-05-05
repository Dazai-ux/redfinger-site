// ==UserScript==
// @name         Redfinger Auto Capture
// @namespace    https://dazai-ux.github.io
// @version      1.7
// @description  Shows credentials in a clean box
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
            position: fixed; bottom: 25px; right: 25px; z-index: 9999999;
            padding: 16px 24px; background: linear-gradient(90deg, #3b82f6, #60a5fa);
            color: white; border: none; border-radius: 50px; font-size: 16px; font-weight: bold;
            box-shadow: 0 8px 25px rgba(59,130,246,0.5); cursor: pointer;
        `;

        btn.onclick = showCredentialsBox;
        document.body.appendChild(btn);
    }

    function showCredentialsBox() {
        let userId = "Not Found";
        let sessionId = "Not Found";
        let uuid = "Not Found";

        // Better detection
        const elements = document.querySelectorAll('*');
        for (let el of elements) {
            const auth = el.getAttribute('authorization') || el.getAttribute('Authorization');
            if (auth && auth.includes(' ')) {
                const parts = auth.trim().split(/\s+/);
                if (parts.length >= 2) {
                    userId = parts[0];
                    sessionId = parts[1];
                    break;
                }
            }
        }

        uuid = localStorage.getItem('uuid') || 
               localStorage.getItem('deviceId') || 
               localStorage.getItem('UUID') || "Please get manually from F12";

        const html = `
            <div style="position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); 
                        background:#1e2937; padding:25px; border-radius:16px; z-index:99999999; 
                        max-width:90%; width:380px; box-shadow:0 0 30px rgba(0,0,0,0.8); color:white; font-family:sans-serif;">
                <h3 style="margin:0 0 15px 0; color:#60a5fa;">✅ Captured Redfinger Info</h3>
                <div style="background:#0f172a; padding:12px; border-radius:8px; margin:10px 0; font-size:14px;">
                    <strong>User ID:</strong> ${userId}<br><br>
                    <strong>Session ID:</strong> ${sessionId}<br><br>
                    <strong>UUID:</strong> ${uuid}
                </div>
                <button onclick="copyToClipboard()" style="width:100%; padding:14px; background:#22c55e; color:black; border:none; border-radius:8px; font-weight:bold; margin-top:10px;">
                    📋 COPY ALL
                </button>
                <button onclick="this.parentElement.remove()" style="width:100%; padding:12px; background:#64748b; color:white; border:none; border-radius:8px; margin-top:8px;">
                    Close
                </button>
            </div>
        `;

        const modal = document.createElement('div');
        modal.innerHTML = html;
        document.body.appendChild(modal);

        window.copyToClipboard = function() {
            const text = `User ID: ${userId}\nSession ID: ${sessionId}\nUUID: ${uuid}`;
            GM_setClipboard(text);
            alert("✅ Copied to clipboard!\n\nNow paste on the website.");
        };
    }

    setTimeout(createButton, 2500);
})();
