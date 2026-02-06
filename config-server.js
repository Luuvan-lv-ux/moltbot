require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.CONFIG_SERVER_PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'config-ui')));

// CORS cho Telegram WebApp
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// API: Lấy config hiện tại
app.get('/api/config', (req, res) => {
    try {
        const configPath = path.join(__dirname, 'openclaw.json');
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            res.json({ success: true, config });
        } else {
            res.json({ success: false, error: 'Config file not found' });
        }
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// API: Lưu config
app.post('/api/config', (req, res) => {
    try {
        const configPath = path.join(__dirname, 'openclaw.json');
        fs.writeFileSync(configPath, JSON.stringify(req.body, null, 4), 'utf8');
        res.json({ success: true, message: 'Config saved successfully' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// API: Lấy status
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        status: {
            server: 'running',
            time: new Date().toISOString(),
            version: '2.0.0'
        }
    });
});

// Serve config UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'config-ui', 'index.html'));
});

// Telegram WebApp endpoint
app.get('/telegram', (req, res) => {
    res.sendFile(path.join(__dirname, 'config-ui', 'telegram-app.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🎛️  Moltbot Config Server running at http://localhost:${port}`);
    console.log(`📱 Telegram Mini App: http://localhost:${port}/telegram`);
    console.log(`💻 Desktop Config UI: http://localhost:${port}`);
});
