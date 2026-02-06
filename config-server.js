
process.on('uncaughtException', (err) => {
    console.error('CRITICAL ERROR (Uncaught):', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL ERROR (Unhandled Rejection):', reason);
});

require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const app = express();
const port = process.env.CONFIG_SERVER_PORT || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'config-ui')));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Realtime Logs
const LOG_BUFFER_SIZE = 200;
global.logs = [];

function addLog(type, message) {
    const timestamp = Date.now();
    global.logs.push({
        type,
        message,
        timestamp,
        time: new Date().toLocaleTimeString('vi-VN')
    });
    if (global.logs.length > LOG_BUFFER_SIZE) global.logs.shift();
}

// APIs
app.get('/api/config', (req, res) => {
    try {
        const configPath = path.join(__dirname, 'config.json');
        if (fs.existsSync(configPath)) {
            const config = fs.readFileSync(configPath, 'utf8');
            res.json(JSON.parse(config));
        } else {
            res.status(404).json({ error: 'Config file not found' });
        }
    } catch (e) { res.json({ success: false, error: e.message }); }
});

app.post('/api/config', (req, res) => {
    try {
        fs.writeFileSync(path.join(__dirname, 'openclaw.json'), JSON.stringify(req.body, null, 4));
        res.json({ success: true });
    } catch (e) { res.json({ success: false, error: e.message }); }
});

app.post('/api/bot/config', (req, res) => {
    try {
        const configPath = path.join(__dirname, 'config.json');
        // We write the entire body as the new config
        fs.writeFileSync(configPath, JSON.stringify(req.body, null, 2));

        console.log('[DEBUG] Received model:', req.body?.agents?.defaults?.model?.primary);

        // CRITICAL: Also sync model to OpenClaw's user config
        const openclawConfigPath = path.join(require('os').homedir(), '.openclaw', 'openclaw.json');
        console.log('[DEBUG] OpenClaw config path:', openclawConfigPath);
        console.log('[DEBUG] File exists:', fs.existsSync(openclawConfigPath));

        if (fs.existsSync(openclawConfigPath)) {
            try {
                const openclawConfig = JSON.parse(fs.readFileSync(openclawConfigPath, 'utf8'));
                const newModel = req.body?.agents?.defaults?.model?.primary;
                console.log('[DEBUG] Syncing model to OpenClaw:', newModel);

                if (newModel) {
                    // Update the model in OpenClaw config
                    openclawConfig.agents = openclawConfig.agents || { defaults: {} };
                    openclawConfig.agents.defaults = openclawConfig.agents.defaults || {};
                    openclawConfig.agents.defaults.model = { primary: newModel };
                    openclawConfig.agents.defaults.models = { [newModel]: {} };

                    fs.writeFileSync(openclawConfigPath, JSON.stringify(openclawConfig, null, 2));
                    console.log('[DEBUG] Successfully synced model to OpenClaw');
                    addLog('success', `🔄 Đã đồng bộ Model sang OpenClaw: ${newModel}`);
                }
            } catch (syncErr) {
                console.error('[DEBUG] Sync error:', syncErr);
                addLog('warning', `⚠️ Không thể đồng bộ OpenClaw config: ${syncErr.message}`);
            }
        }

        // Log that config was updated
        addLog('success', '📝 Cấu hình đã được cập nhật!');

        res.json({ success: true, message: 'Saved successfully' });
    } catch (e) { res.json({ success: false, error: e.message }); }
});

// Bot Control
global.botProcess = null;
global.botRunning = false;

app.get('/api/status', (req, res) => {
    // Check if port 18789 is in use to determine if bot is actually running
    // This handles the "zombie" case where server restarted but bot didn't
    const port = 18789;
    const cmd = process.platform === 'win32'
        ? `netstat -ano | findstr :${port}`
        : `lsof -i :${port}`;

    require('child_process').exec(cmd, (err, stdout) => {
        const isPortInUse = stdout && stdout.length > 0;
        // If port is in use, assuming bot is running even if global.botRunning is false (recovery)
        const isRunning = global.botRunning || isPortInUse;

        if (isPortInUse && !global.botRunning) {
            // Recover state
            global.botRunning = true;
        }

        res.json({
            success: true,
            status: {
                server: 'running',
                time: new Date().toISOString(),
                version: '2.0.0',
                botRunning: isRunning
            }
        });
    });
});

app.post('/api/bot/start', (req, res) => {
    if (global.botProcess) return res.json({ success: false, error: 'Bot đang chạy' });

    addLog('info', '🚀 Đang khởi động OpenClaw Gateway...');
    console.log('Starting OpenClaw...');
    console.log('[DEBUG] Current directory:', __dirname);
    console.log('[DEBUG] Platform:', process.platform);

    const cmd = process.platform === 'win32' ? 'openclaw.cmd' : 'openclaw';
    console.log('[DEBUG] Command:', cmd);

    // Refresh PATH to include npm global bin
    const env = { ...process.env };
    console.log('[DEBUG] TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET');
    console.log('[DEBUG] MOONSHOT_API_KEY:', process.env.MOONSHOT_API_KEY ? 'SET' : 'NOT SET');
    console.log('[DEBUG] OPENCLAW_GATEWAY_TOKEN:', process.env.OPENCLAW_GATEWAY_TOKEN ? 'SET' : 'NOT SET');

    // Validate Environment
    const requiredKeys = ['TELEGRAM_BOT_TOKEN', 'MOONSHOT_API_KEY'];
    const missingKeys = requiredKeys.filter(k => !process.env[k]);

    if (missingKeys.length > 0) {
        const errorMsg = `Thiếu cấu hình: ${missingKeys.join(', ')}. Vui lòng kiểm tra file .env`;
        addLog('error', errorMsg);
        return res.json({ success: false, error: errorMsg });
    }



    global.botProcess = spawn(cmd, ['gateway', 'run'], {
        cwd: __dirname,
        env: env,
        shell: true
    });

    global.botProcess.stdout.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg) {
            console.log(`[BOT] ${msg}`);
            addLog('info', msg);
        }
    });

    global.botProcess.stderr.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg) {
            console.error(`[BOT ERR] ${msg}`);
            addLog('info', msg);
        }
    });

    global.botProcess.on('error', (err) => {
        addLog('error', `Lỗi khởi động: ${err.message}`);
        console.error('Failed to start:', err);
    });

    global.botProcess.on('close', (code) => {
        addLog('warning', `Bot đã dừng (Exit Code: ${code})`);
        console.log(`Bot exited with code ${code}`);
        global.botProcess = null;
        global.botRunning = false;
    });

    global.botRunning = true;

    // Log Active Model
    const configPath = path.join(__dirname, 'config.json');
    if (fs.existsSync(configPath)) {
        const conf = JSON.parse(fs.readFileSync(configPath));
        const model = conf.agents?.defaults?.model?.primary || 'moonshot/kimi-k2.5';
        setTimeout(() => addLog('success', `🧠 Đang sử dụng Model: ${model}`), 1000);
    }

    res.json({ success: true, message: 'Bot đang khởi động...' });
});

app.post('/api/google/login', (req, res) => {
    // Run local command to login
    // Assuming 'openclaw models auth login google-antigravity' or similar
    // Since we used google-antigravity-auth plugin, it might be auto handled, but explicit login is good.
    const cmd = `npx openclaw models auth login google-antigravity`;

    // We run this detached so it pops up in the server console/browser
    const child = require('child_process').exec(cmd, { cwd: __dirname });

    child.stdout.on('data', (data) => addLog('info', `Auth Output: ${data}`));
    child.stderr.on('data', (data) => addLog('error', `Auth Error: ${data}`));

    res.json({ success: true, message: 'Auth command executed' });
});

app.post('/api/bot/stop', (req, res) => {
    addLog('warning', 'Đang dừng bot...');

    // Use openclaw gateway stop for proper shutdown (releases port correctly)
    const cmd = process.platform === 'win32' ? 'openclaw.cmd' : 'openclaw';
    const stopProcess = spawn(cmd, ['gateway', 'stop'], {
        cwd: __dirname,
        shell: true
    });

    stopProcess.on('close', (code) => {
        if (code === 0) {
            addLog('success', '⏹️ Bot đã dừng.');
        } else {
            // Fallback: kill process tree if gateway stop fails
            if (global.botProcess) {
                try {
                    process.kill(global.botProcess.pid, 'SIGKILL');
                } catch (e) { }
            }
            addLog('warning', '⏹️ Bot đã dừng (force kill).');
        }
        global.botProcess = null;
        global.botRunning = false;
    });

    // Also kill proxy if running
    if (global.proxyProcess) {
        try { process.kill(global.proxyProcess.pid); } catch (e) { }
        global.proxyProcess = null;
    }

    res.json({ success: true });
});
// CLI Runner API
app.post('/api/cli/run', (req, res) => {
    const { command, args = [] } = req.body;
    addLog('info', `🛠️ Chạy lệnh CLI: openclaw ${command} ${args.join(' ')}`);

    const cmd = process.platform === 'win32' ? 'openclaw.cmd' : 'openclaw';
    const cliProcess = spawn(cmd, [command, ...args], {
        cwd: require('os').homedir(),
        shell: true
    });

    let output = '';

    cliProcess.stdout.on('data', d => {
        const text = d.toString().trim();
        output += text + '\n';
        addLog('info', `CLI: ${text}`);
    });

    cliProcess.stderr.on('data', d => {
        const text = d.toString().trim();
        output += text + '\n';
        addLog('error', `CLI Error: ${text}`);
    });

    cliProcess.on('close', (code) => {
        addLog(code === 0 ? 'success' : 'error', `Lệnh kết thúc với mã: ${code}`);
        res.json({ success: code === 0, output, code });
    });
});

app.post('/api/bot/restart', (req, res) => {
    addLog('warning', '🔄 Đang khởi động lại bot...');
    // Logic restart sẽ được xử lý bởi client gọi lại /api/bot/start sau khi stop
    if (global.botProcess) {
        process.kill(global.botProcess.pid);
        global.botProcess = null;
        global.botRunning = false;
    }
    setTimeout(() => {
        res.json({ success: true });
    }, 1000);
});
app.get('/api/bot/status', (req, res) => {
    res.json({ success: true, running: global.botRunning });
});

// Auth APIs
app.get('/api/auth/status', (req, res) => {
    const authPath = path.join(require('os').homedir(), '.openclaw', 'agents', 'main', 'agent', 'auth-profiles.json');
    try {
        if (fs.existsSync(authPath)) {
            const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));
            const profiles = authData.profiles || [];
            if (profiles.length > 0) {
                const activeProfile = profiles.find(p => p.active) || profiles[0];
                return res.json({
                    success: true,
                    loggedIn: true,
                    account: {
                        name: activeProfile.name || activeProfile.email?.split('@')[0] || 'User',
                        email: activeProfile.email || 'unknown',
                        avatar: activeProfile.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeProfile.name || 'U')}&background=6366f1&color=fff`
                    }
                });
            }
        }
        res.json({ success: true, loggedIn: false });
    } catch (e) {
        console.error('Auth status error:', e);
        res.json({ success: true, loggedIn: false });
    }
});

app.post('/api/auth/login', (req, res) => {
    addLog('info', '🔐 Đang mở trang đăng nhập Google...');

    const cmd = process.platform === 'win32' ? 'openclaw.cmd' : 'openclaw';
    const authProcess = spawn(cmd, ['models', 'auth', 'login', '--provider', 'google-antigravity', '--set-default'], {
        cwd: require('os').homedir(),
        shell: true,
        stdio: 'inherit'
    });

    authProcess.on('close', (code) => {
        if (code === 0) {
            addLog('success', '✅ Đăng nhập Google thành công!');
        } else {
            addLog('error', `⚠️ Đăng nhập kết thúc với mã: ${code}`);
        }
    });

    res.json({ success: true, message: 'Đang mở trình duyệt để đăng nhập...' });
});

app.post('/api/auth/logout', (req, res) => {
    const authPath = path.join(require('os').homedir(), '.openclaw', 'agents', 'main', 'agent', 'auth-profiles.json');
    try {
        if (fs.existsSync(authPath)) {
            fs.unlinkSync(authPath);
            addLog('info', '🚪 Đã đăng xuất tài khoản.');
        }
        res.json({ success: true });
    } catch (e) {
        res.json({ success: false, error: e.message });
    }
});

app.get('/api/logs', (req, res) => {
    const after = parseInt(req.query.after) || 0;
    const newLogs = global.logs.filter(l => l.timestamp > after);
    res.json({ success: true, logs: newLogs });
});

app.post('/api/command', (req, res) => {
    const { command } = req.body;
    addLog('info', `👨‍💻 Gửi lệnh: ${command}`);

    const cmd = process.platform === 'win32' ? 'openclaw.cmd' : 'openclaw';
    const agent = spawn(cmd, ['agent', '--config', 'openclaw.json', '--target', '@self', '--message', command, '--allow-unconfigured'], {
        cwd: __dirname,
        shell: true
    });

    agent.stdout.on('data', d => addLog('success', `🤖: ${d.toString().trim()}`));
    agent.stderr.on('data', d => addLog('info', `🤖: ${d.toString().trim()}`));

    res.json({ success: true, message: 'Đang thực thi...' });
});

// UI
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'config-ui', 'index.html')));
app.get('/telegram', (req, res) => res.sendFile(path.join(__dirname, 'config-ui', 'telegram-app.html')));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
