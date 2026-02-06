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
            version: '2.0.0',
            botRunning: global.botRunning || false
        }
    });
});

// Bot state
global.botRunning = false;
global.botStartTime = null;

// API: Start bot
app.post('/api/bot/start', (req, res) => {
    if (global.botRunning) {
        return res.json({ success: false, error: 'Bot đã đang chạy' });
    }

    global.botRunning = true;
    global.botStartTime = new Date();
    console.log('🚀 Bot started at:', global.botStartTime.toISOString());

    res.json({
        success: true,
        message: 'Bot đã khởi động',
        startTime: global.botStartTime.toISOString()
    });
});

// API: Stop bot
app.post('/api/bot/stop', (req, res) => {
    if (!global.botRunning) {
        return res.json({ success: false, error: 'Bot đã tắt' });
    }

    const uptime = global.botStartTime ? Math.floor((new Date() - global.botStartTime) / 1000) : 0;
    global.botRunning = false;
    global.botStartTime = null;
    console.log('⏹️ Bot stopped. Uptime:', uptime, 'seconds');

    res.json({
        success: true,
        message: 'Bot đã dừng',
        uptime: uptime
    });
});

// API: Get bot status
app.get('/api/bot/status', (req, res) => {
    let uptime = 0;
    if (global.botRunning && global.botStartTime) {
        uptime = Math.floor((new Date() - global.botStartTime) / 1000);
    }

    res.json({
        success: true,
        running: global.botRunning,
        startTime: global.botStartTime?.toISOString() || null,
        uptime: uptime
    });
});

// API: Execute command (for quick commands)
app.post('/api/command', (req, res) => {
    const { command } = req.body;

    if (!command) {
        return res.json({ success: false, error: 'Thiếu lệnh' });
    }

    if (!global.botRunning) {
        return res.json({ success: false, error: 'Bot chưa chạy' });
    }

    console.log('📤 Received command:', command);

    // TODO: Send to OpenClaw agent
    res.json({
        success: true,
        message: 'Đã nhận lệnh',
        command: command
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
