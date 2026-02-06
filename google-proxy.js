require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PROXY_PORT || 3000;

// Đọc keys từ biến môi trường
const keys = [];
for (let i = 1; i <= 10; i++) {
    const key = process.env[`GOOGLE_API_KEY_${i}`];
    if (key) keys.push(key);
}

if (keys.length === 0) {
    console.error('❌ Không tìm thấy Google API Key nào trong file .env');
    console.error('   Vui lòng thêm GOOGLE_API_KEY_1, GOOGLE_API_KEY_2, ... vào file .env');
    process.exit(1);
}

let currentKeyIndex = 0;

app.use(express.json({ limit: '50mb' }));

// Log all incoming requests
app.use((req, res, next) => {
    console.log(`[Proxy] Incoming ${req.method} ${req.originalUrl}`);
    console.log(`[Proxy] Body:`, JSON.stringify(req.body).substring(0, 200));
    next();
});

app.use(async (req, res) => {
    let attempts = 0;

    while (attempts < keys.length) {
        const key = keys[currentKeyIndex];
        // Build target URL - append key as query param
        const separator = req.originalUrl.includes('?') ? '&' : '?';
        const targetUrl = `https://generativelanguage.googleapis.com${req.originalUrl}${separator}key=${key}`;

        console.log(`[Proxy] → Forwarding with Key #${currentKeyIndex + 1} (${key.substr(0, 10)}...)`);
        console.log(`[Proxy] → URL: ${targetUrl.replace(key, 'KEY_HIDDEN')}`);

        try {
            const response = await axios({
                method: req.method,
                url: targetUrl,
                data: req.body,
                headers: {
                    'Content-Type': 'application/json'
                },
                validateStatus: () => true // Handle all status codes
            });

            console.log(`[Proxy] ← Status: ${response.status}`);

            // Check for quota errors
            if (response.status === 429 || response.status === 403 ||
                (response.data?.error?.code === 429) ||
                (response.data?.error?.status === 'RESOURCE_EXHAUSTED')) {
                console.warn(`[Proxy] ⚠️  Key #${currentKeyIndex + 1} quota exhausted. Switching...`);
                currentKeyIndex = (currentKeyIndex + 1) % keys.length;
                attempts++;
                continue; // Try next key
            }

            // Success or non-quota error - return response
            return res.status(response.status).json(response.data);

        } catch (err) {
            console.error(`[Proxy] ❌ Network Error:`, err.message);
            if (err.response) {
                console.error(`[Proxy] Response status:`, err.response.status);
                console.error(`[Proxy] Response data:`, err.response.data);
            }
            // Try next key on network error
            currentKeyIndex = (currentKeyIndex + 1) % keys.length;
            attempts++;
        }
    }

    console.error('[Proxy] ❌ All keys exhausted!');
    res.status(500).json({ error: "All API keys exhausted or failed." });
});

app.listen(port, () => {
    console.log(`🔑 Google Key Rotation Proxy listening at http://localhost:${port}`);
    console.log(`📊 Managing ${keys.length} API keys`);
});
