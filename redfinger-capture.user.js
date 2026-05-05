// ==UserScript==
// @name         Redfinger Auto Capture
// @namespace    https://dazai-ux.github.io
// @version      2.2
// @description  Capture from headers + storage + request payloads
// @author       Redfinger Auto
// @match        https://www.cloudemulator.net/*
// @grant        GM_setClipboard
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    let capturedData = {
        userId: "Not Found",
        sessionId: "Not Found",
        uuid: "Not Found",
        username: "Not Found",
        email: "Not Found",
        deviceId: "Not Found"
    };

    function createButton() {
        if (document.getElementById('rf-capture-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'rf-capture-btn';
        btn.innerHTML = '📋 COPY REDFINGER INFO';
        btn.style.cssText = `
            position: fixed !important; bottom: 25px !important; right: 25px !important;
            z-index: 2147483647 !important; padding: 16px 28px !important;
            background: linear-gradient(90deg, #3b82f6, #1e90ff) !important; color: white !important;
            border: none !important; border-radius: 50px !important; font-size: 16px !important;
            font-weight: bold !important; box-shadow: 0 10px 30px rgba(59,130,246,0.85) !important;
            cursor: pointer !important; transition: all 0.3s !important;
        `;
        btn.onclick = () => showCapturedInfo();
        document.body.appendChild(btn);
    }

    // Intercept Fetch (most common modern method)
    const originalFetch = window.fetch;
    window.fetch = async function (url, options = {}) {
        try {
            // Check headers
            if (options.headers) {
                const auth = options.headers.Authorization || options.headers.authorization;
                if (auth && typeof auth === 'string') {
                    const parts = auth.trim().split(/\s+/);
                    if (parts.length >= 2) {
                        capturedData.userId = parts[0];
                        capturedData.sessionId = parts[1];
                    }
                }
            }

            // Check payload body
            if (options.body) {
                let bodyStr = options.body;
                if (bodyStr instanceof FormData) {
                    // Can't easily read FormData, skip or use other methods
                } else if (typeof bodyStr === 'string') {
                    processPayload(bodyStr);
                } else if (bodyStr instanceof Blob || bodyStr instanceof ArrayBuffer) {
                    // Rare case
                } else {
                    try {
                        processPayload(JSON.stringify(bodyStr));
                    } catch (e) {}
                }
            }
        } catch (e) { }

        return originalFetch.apply(this, arguments);
    };

    // Intercept XMLHttpRequest (fallback for older code)
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url) {
        this._url = url;
        return originalXHROpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function (body) {
        if (body) {
            try {
                processPayload(typeof body === 'string' ? body : JSON.stringify(body));
            } catch (e) {}
        }
        return originalXHRSend.apply(this, arguments);
    };

    function processPayload(payloadStr) {
        try {
            const data = JSON.parse(payloadStr);

            // Common field names – adjust based on what you see in DevTools
            if (data.userId || data.userid || data.uid) capturedData.userId = data.userId || data.userid || data.uid;
            if (data.session || data.sessionId || data.token || data.accessToken) {
                capturedData.sessionId = data.session || data.sessionId || data.token || data.accessToken;
            }
            if (data.uuid || data.deviceId || data.device_id || data.fingerPrint) {
                capturedData.uuid = data.uuid || data.deviceId || data.device_id || data.fingerPrint;
            }
            if (data.username) capturedData.username = data.username;
            if (data.email) capturedData.email = data.email;
            if (data.deviceId || data.device_id) capturedData.deviceId = data.deviceId || data.device_id;

        } catch (e) {
            // Not JSON – try regex for safety
            const uuidMatch = payloadStr.match(/"?(uuid|deviceId|device_id)"?\s*[:=]\s*"?([^",}]{20,})"?/i);
            if (uuidMatch) capturedData.uuid = uuidMatch[2];

            const sessionMatch = payloadStr.match(/"?(session|sessionId|token)"?\s*[:=]\s*"?([^",}]{15,})"?/i);
            if (sessionMatch) capturedData.sessionId = sessionMatch[2];
        }
    }

    function showCapturedInfo() {
        // Also scan storage as backup
        const allStorage = { ...localStorage, ...sessionStorage };
        for (let key in allStorage) {
            const val = allStorage[key];
            if (typeof val !== 'string') continue;

            if (key.toLowerCase().includes('uuid') || key.toLowerCase().includes('device')) {
                capturedData.uuid = val;
            }
            if ((key.toLowerCase().includes('auth') || key.toLowerCase().includes('token')) && val.includes(' ')) {
                const parts = val.trim().split(/\s+/);
                if (parts.length >= 2) {
                    capturedData.userId = parts[0];
                    capturedData.sessionId = parts[1];
                }
            }
        }

        const text = `🔑 Redfinger Credentials\n\n` +
                     `👤 Username : ${capturedData.username}\n` +
                     `📧 Email    : ${capturedData.email}\n` +
                     `🆔 User ID  : ${capturedData.userId}\n` +
                     `🔑 Session  : ${capturedData.sessionId}\n` +
                     `📱 UUID     : ${capturedData.uuid}\n` +
                     `📟 Device   : ${capturedData.deviceId}\n` +
                     `⏰ Time     : ${new Date().toLocaleString()}`;

        GM_setClipboard(text);

        alert(`✅ Captured Successfully!\n\n` +
              `User ID : ${capturedData.userId}\n` +
              `Session : ${capturedData.sessionId ? capturedData.sessionId.substring(0,20)+'...' : 'Not Found'}\n` +
              `UUID    : ${capturedData.uuid}\n\n` +
              `📋 Copied to clipboard! Paste on the order page.`);
    }

    // Initialize
    setTimeout(() => {
        createButton();

        // Re-attach button on dynamic page changes
        new MutationObserver(() => {
            if (!document.getElementById('rf-capture-btn')) createButton();
        }).observe(document.body, { childList: true, subtree: true });
    }, 1500);

})();
