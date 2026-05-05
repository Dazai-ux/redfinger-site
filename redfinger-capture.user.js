// ==UserScript==
// @name         Redfinger Auto Capture
// @namespace    https://dazai-ux.github.io
// @version      2.3
// @description  Captures userId, sessionId, uuid from URL query params + headers + storage
// @author       Redfinger Auto
// @match        https://www.cloudemulator.net/*
// @grant        GM_setClipboard
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    let captured = {
        userId: "Not Found",
        sessionId: "Not Found",
        uuid: "Not Found",
        username: "Not Found",
        email: "Not Found"
    };

    // Helper: Parse query string from URL
    function extractFromUrl(url) {
        try {
            const urlObj = new URL(url);
            const params = urlObj.searchParams;

            if (params.has('userId')) captured.userId = params.get('userId');
            if (params.has('sessionId')) captured.sessionId = params.get('sessionId');
            if (params.has('uuid')) captured.uuid = params.get('uuid');
            if (params.has('deviceId')) captured.uuid = params.get('deviceId'); // fallback
        } catch (e) {}
    }

    // === Intercept Fetch ===
    const originalFetch = window.fetch;
    window.fetch = async function (input, init = {}) {
        let url = typeof input === 'string' ? input : input.url || input;

        if (url) extractFromUrl(url);

        // Also check headers in case they use Authorization too
        if (init && init.headers) {
            const auth = init.headers.Authorization || init.headers.authorization;
            if (auth) {
                const parts = auth.trim().split(/\s+/);
                if (parts.length >= 2) {
                    captured.userId = parts[0];
                    captured.sessionId = parts[1];
                }
            }
        }

        return originalFetch.apply(this, arguments);
    };

    // === Intercept XMLHttpRequest ===
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        if (url) extractFromUrl(url);
        return originalOpen.apply(this, arguments);
    };

    // Backup: Scan storage
    function scanStorage() {
        const storages = [localStorage, sessionStorage];
        storages.forEach(storage => {
            for (let key in storage) {
                const val = storage[key];
                if (typeof val !== 'string') continue;

                if (key.toLowerCase().includes('uuid') || key.toLowerCase().includes('device')) {
                    captured.uuid = val;
                }
                if ((key.toLowerCase().includes('auth') || key.toLowerCase().includes('token')) && val.includes(' ')) {
                    const parts = val.trim().split(/\s+/);
                    if (parts.length >= 2) {
                        captured.userId = parts[0];
                        captured.sessionId = parts[1];
                    }
                }
            }
        });
    }

    function createButton() {
        if (document.getElementById('rf-capture-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'rf-capture-btn';
        btn.innerHTML = '📋 COPY REDFINGER INFO';
        btn.style.cssText = `
            position: fixed !important; bottom: 25px !important; right: 25px !important;
            z-index: 2147483647 !important; padding: 16px 28px !important;
            background: linear-gradient(90deg, #22c55e, #86efac) !important; color: black !important;
            border: none !important; border-radius: 50px !important; font-size: 16px !important;
            font-weight: bold !important; box-shadow: 0 10px 30px rgba(74,222,128,0.6) !important;
            cursor: pointer !important; transition: all 0.3s !important;
        `;

        btn.onclick = () => {
            scanStorage(); // final check

            const text = `🔑 Redfinger Credentials\n\n` +
                         `👤 Username : ${captured.username}\n` +
                         `🆔 User ID  : ${captured.userId}\n` +
                         `🔑 Session  : ${captured.sessionId}\n` +
                         `📱 UUID     : ${captured.uuid}\n` +
                         `⏰ Time     : ${new Date().toLocaleString()}`;

            GM_setClipboard(text);

            alert(`✅ Capture Successful!\n\n` +
                  `User ID  : ${captured.userId}\n` +
                  `Session  : ${captured.sessionId ? captured.sessionId.substring(0,20) + '...' : 'Not Found'}\n` +
                  `UUID     : ${captured.uuid}\n\n` +
                  `📋 Copied to clipboard! Paste it on the website.`);
        };

        document.body.appendChild(btn);
    }

    // Initialize
    setTimeout(() => {
        createButton();
        scanStorage();

        // Re-create button if removed
        new MutationObserver(() => {
            if (!document.getElementById('rf-capture-btn')) createButton();
        }).observe(document.body, { childList: true, subtree: true });
    }, 1200);

})();
