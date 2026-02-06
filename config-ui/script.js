// ==== MOLTBOT CONFIG UI v2.1 - Model Auto-Save ====
console.log('%c🤖 Moltbot Config UI v2.1 loaded', 'color: #00ff00; font-weight: bold');
const API_BASE = window.location.origin;

// ==================== CONSOLE LOGGING ====================
function logToConsole(type, message) {
    const consoleEl = document.querySelector('.console-content');
    if (!consoleEl) return;

    const now = new Date();
    const time = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const logEntry = document.createElement('div');
    logEntry.className = `console-entry console-${type}`;
    logEntry.innerHTML = `<span class="timestamp">${time}</span> <span class="log-message">${message}</span>`;

    consoleEl.appendChild(logEntry);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}


// Global Preset Selectors
function selectBotPreset(value) {
    if (value) {
        document.getElementById('telegramToken').value = value;
    }
}

function selectApiKeyPreset(value) {
    if (value) {
        document.getElementById('moonshotApiKey').value = value;
    }
}

// ==================== BOT CONTROL FUNCTIONS ====================
async function saveAndSyncConfig() {
    const config = buildConfig();
    console.log('[DEBUG] Saving config with model:', config.agents?.defaults?.model?.primary);
    try {
        const res = await fetch(`${API_BASE}/api/bot/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
        const data = await res.json();
        console.log('[DEBUG] Server response:', data);
        if (data.success) {
            showToast('💾', 'Đã lưu và đồng bộ cấu hình!');
            logToConsole('success', '💾 Cấu hình đã được lưu và đồng bộ sang OpenClaw!');
            // Update stat card
            const model = config.agents?.defaults?.model?.primary || 'moonshot/kimi-k2.5';
            document.getElementById('statModel').textContent = model.split('/').pop();
        } else {
            showToast('❌', 'Lỗi lưu: ' + data.error);
        }
    } catch (e) {
        console.error('[DEBUG] Error saving config:', e);
        showToast('❌', 'Không thể kết nối server');
    }
}

async function startBot() {
    // CRITICAL: Auto-save config before starting to ensure model selection is applied
    logToConsole('info', '💾 Đang lưu cấu hình...');
    await saveAndSyncConfig();

    logToConsole('info', '🚀 Đang khởi động OpenClaw Gateway...');
    try {
        const res = await fetch(`${API_BASE}/api/bot/start`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            logToConsole('success', '✅ Moltbot (OpenClaw) đã khởi động!');
        } else {
            logToConsole('error', '❌ Lỗi khởi động: ' + data.error);
        }
    } catch (e) {
        logToConsole('error', '❌ Không thể kết nối server');
    }
}

async function stopBot() {
    try {
        logToConsole('warning', 'Đang dừng bot...');
        const res = await fetch(`${API_BASE}/api/bot/stop`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            logToConsole('success', '⏹️ Bot đã dừng.');
        } else {
            logToConsole('error', '❌ Lỗi dừng bot: ' + data.error);
        }
    } catch (e) {
        logToConsole('error', '❌ Không thể kết nối server');
    }
}

// Auth Functions
async function checkAuthStatus() {
    try {
        const res = await fetch(`${API_BASE}/api/auth/status`);
        const data = await res.json();

        const loggedOutDiv = document.getElementById('authLoggedOut');
        const loggedInDiv = document.getElementById('authLoggedIn');

        if (data.loggedIn) {
            loggedOutDiv.style.display = 'none';
            loggedInDiv.style.display = 'block';

            document.getElementById('authName').textContent = data.account.name;
            document.getElementById('authEmail').textContent = data.account.email;
            document.getElementById('authAvatar').src = data.account.avatar;
        } else {
            loggedOutDiv.style.display = 'block';
            loggedInDiv.style.display = 'none';
        }
    } catch (e) {
        console.error('Auth check error:', e);
    }
}

async function handleGoogleLogin() {
    try {
        const btn = document.getElementById('googleLoginBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span>⏳ Đang mở cửa sổ...</span>';
        btn.disabled = true;

        // Trigger login
        fetch(`${API_BASE}/api/auth/login`, { method: 'POST' }).catch(e => console.error(e));

        showToast('🔐', 'Đang mở trình duyệt để đăng nhập...');

        // Poll for success
        let attempts = 0;
        const checkInterval = setInterval(async () => {
            attempts++;
            const statusRes = await fetch(`${API_BASE}/api/auth/status`);
            const statusData = await statusRes.json();

            if (statusData.loggedIn) {
                clearInterval(checkInterval);
                checkAuthStatus();
                showToast('✅', 'Đăng nhập thành công!');
                btn.innerHTML = originalText;
                btn.disabled = false;
            }

            // Stop polling after 60s
            if (attempts > 30) {
                clearInterval(checkInterval);
                btn.innerHTML = originalText;
                btn.disabled = false;
                showToast('⚠️', 'Hết thời gian chờ đăng nhập. Hãy thử lại.');
            }
        }, 2000);

    } catch (e) {
        showToast('❌', 'Lỗi kết nối server');
        const btn = document.getElementById('googleLoginBtn');
        if (btn) btn.disabled = false;
    }
}

function toggleAuthMenu() {
    document.getElementById('authDropdown').classList.toggle('show');
}

// Close dropdown when clicking outside
window.addEventListener('click', (e) => {
    if (!e.target.closest('.auth-account')) {
        const dropdown = document.getElementById('authDropdown');
        if (dropdown && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    }
});

async function handleLogout() {
    try {
        await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
        checkAuthStatus();
        showToast('👋', 'Đã đăng xuất');
    } catch (e) {
        console.error(e);
    }
}

async function runCliCommand(command, args = []) {
    logToConsole('info', `🚀 Đang chạy: openclaw ${command} ${args.join(' ')}...`);

    try {
        const res = await fetch(`${API_BASE}/api/cli/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command, args })
        });

        const data = await res.json();

        if (data.success) {
            logToConsole('success', '✅ Lệnh thành công!');

            // Special handling for output display
            if (data.output) {
                data.output.split('\n').forEach(line => {
                    if (line.trim()) logToConsole('info', `> ${line}`);
                });
            }

            // Refresh logs if running status check
            if (command === 'doctor') {
                showToast('✅', 'Đã kiểm tra hệ thống xong');
            }
        } else {
            logToConsole('error', `❌ Lỗi: Mã thoát ${data.code}`);
            if (data.output) {
                data.output.split('\n').forEach(line => {
                    if (line.trim()) logToConsole('error', `> ${line}`);
                });
            }
        }
    } catch (e) {
        logToConsole('error', `❌ Lỗi kết nối: ${e.message}`);
    }
}

function switchAccount() {
    handleGoogleLogin();
}

document.addEventListener('DOMContentLoaded', () => {
    // ==================== STATE ====================
    let currentConfig = {};
    let scripts = [];
    let editingScriptId = null;
    let botRunning = false;
    let botStartTime = null;
    let tasksCompleted = 0;
    let uptimeInterval = null;

    // ==================== DOM ELEMENTS ====================
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.config-section');
    const sectionTitle = document.getElementById('sectionTitle');
    const sectionDesc = document.getElementById('sectionDesc');
    const toast = document.getElementById('toast');

    // Bot Control
    const startBotBtn = document.getElementById('startBotBtn');
    const stopBotBtn = document.getElementById('stopBotBtn');
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');

    // Console
    const consoleOutput = document.getElementById('consoleOutput');
    const clearConsoleBtn = document.getElementById('clearConsole');
    const copyConsoleBtn = document.getElementById('copyConsole');

    // Quick Command
    const quickCommandInput = document.getElementById('quickCommand');
    const sendCommandBtn = document.getElementById('sendCommandBtn');
    const presetBtns = document.querySelectorAll('.preset-btn');

    // Scripts
    const scriptsList = document.getElementById('scriptsList');
    const newScriptBtn = document.getElementById('newScriptBtn');
    const scriptEditorCard = document.getElementById('scriptEditorCard');
    const closeEditorBtn = document.getElementById('closeEditorBtn');
    const saveScriptBtn = document.getElementById('saveScriptBtn');
    const runScriptBtn = document.getElementById('runScriptBtn');
    const scriptTrigger = document.getElementById('scriptTrigger');
    const scriptContent = document.getElementById('scriptContent');

    // Export/Import
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');

    // ==================== SECTION METADATA ====================
    const sectionMeta = {
        dashboard: { title: 'Bảng Điều Khiển', desc: 'Quản lý và điều khiển bot của bạn' },
        scripts: { title: 'Quản lý Kịch bản', desc: 'Tạo các kịch bản để bot tự động thực hiện' },
        model: { title: 'Cấu hình Model AI', desc: 'Chọn và cấu hình các model AI cho bot của bạn' },
        telegram: { title: 'Cấu hình Telegram', desc: 'Kết nối bot với Telegram' },
        gateway: { title: 'Gateway Settings', desc: 'Cấu hình cổng kết nối OpenClaw' },
        agents: { title: 'Cài đặt Agent', desc: 'Điều chỉnh hành vi của AI agent' },
        plugins: { title: 'Plugins', desc: 'Bật/tắt các plugin mở rộng' },
        skills: { title: 'Skills', desc: 'Quản lý các skill của bot' },
        security: { title: 'Bảo mật', desc: 'Cấu hình an toàn và giới hạn' },
        logging: { title: 'Logging', desc: 'Cấu hình ghi log' },
        guide: { title: 'Hướng Dẫn Sử Dụng', desc: 'Tài liệu hướng dẫn chi tiết cách dùng Moltbot' }
    };

    // ==================== EXAMPLE SCRIPTS ====================
    const exampleScripts = {
        'price-check': `1. Mở trình duyệt và vào trang tiki.vn
2. Tìm kiếm sản phẩm "Đắc Nhân Tâm"
3. Lấy giá của 5 sản phẩm đầu tiên và lưu lại
4. Mở trang fahasa.com
5. Tìm kiếm cùng sản phẩm và lấy giá
6. So sánh giá giữa hai trang
7. Gửi báo cáo so sánh giá qua Telegram cho tôi

Lưu ý: Nếu không tìm thấy sản phẩm thì thông báo lỗi.`,

        'daily-news': `1. Mở trình duyệt và vào trang vnexpress.net
2. Lấy 5 tiêu đề tin tức mới nhất
3. Tóm tắt ngắn gọn từng tin (50 từ)
4. Định dạng thành tin nhắn dạng:
   📰 TIN TỨC HÔM NAY
   ━━━━━━━━━━━━━━━
   1. [Tiêu đề 1]
   [Tóm tắt]
   ...
5. Gửi qua Telegram

Chạy lúc 8h sáng mỗi ngày.`,

        'auto-reply': `Khi nhận tin nhắn Telegram chứa từ khóa "giá sách":
1. Trích xuất tên sách từ tin nhắn
2. Tìm kiếm giá trên Tiki và Fahasa
3. Trả lời tin nhắn với format:

📚 KẾT QUẢ TÌM KIẾM: [tên sách]
━━━━━━━━━━━━━━━━━━━━━
🔸 Tiki: [giá] VNĐ
   Link: [url]
🔸 Fahasa: [giá] VNĐ
   Link: [url]
💡 Chênh lệch: [số tiền]

Nếu không tìm thấy, trả lời "Xin lỗi, không tìm thấy sách này."`,

        'web-scrape': `1. Mở danh sách URL từ file data/urls.txt
2. Với mỗi URL:
   a. Mở trang web
   b. Trích xuất tiêu đề, mô tả, và nội dung chính
   c. Lưu vào file JSON với format:
      {
        "url": "...",
        "title": "...",
        "description": "...",
        "content": "...",
        "scraped_at": "..."
      }
3. Lưu tất cả kết quả vào file output/scraped_data.json
4. Gửi thông báo hoàn thành qua Telegram

Bỏ qua các trang lỗi và ghi log.`
    };

    // ==================== NAVIGATION ====================
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.getAttribute('data-section');

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === sectionId) {
                    section.classList.add('active');
                }
            });

            if (sectionMeta[sectionId]) {
                sectionTitle.textContent = sectionMeta[sectionId].title;
                sectionDesc.textContent = sectionMeta[sectionId].desc;
            }
        });
    });

    // ==================== BOT CONTROL ====================
    startBotBtn?.addEventListener('click', () => startBot());
    stopBotBtn?.addEventListener('click', () => stopBot());

    async function handleGoogleLogin() {
        if (!confirm('Bạn có chắc muốn thêm tài khoản mới? Một cửa sổ đăng nhập Google sẽ hiện ra.')) return;

        addLog('info', '🚀 Đang mở trình duyệt để đăng nhập Google...');
        try {
            const res = await fetch('/api/google/login', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                addLog('success', '✅ Đã kích hoạt quy trình đăng nhập. Hãy kiểm tra trình duyệt!');
                alert('Vui lòng kiểm tra cửa sổ trình duyệt vừa bật lên để đăng nhập.');
            } else {
                addLog('error', '❌ Lỗi: ' + data.message);
            }
        } catch (e) {
            addLog('error', '❌ Lỗi kết nối: ' + e.message);
        }
    }

    async function startBot() {
        updateBotStatus('loading', 'Đang khởi động...');
        logToConsole('info', 'Đang khởi động OpenClaw Gateway...');

        try {
            const response = await fetch('/api/bot/start', { method: 'POST' });
            const data = await response.json();

            if (data.success) {
                botRunning = true;
                botStartTime = new Date();
                updateBotStatus('online', 'Đang Chạy');
                startBotBtn.style.display = 'none';
                stopBotBtn.style.display = 'flex';
                logToConsole('success', '✅ Moltbot (OpenClaw) đã khởi động!');
                startLogPolling();
                startUptimeCounter();
            } else {
                updateBotStatus('offline', 'Lỗi Khởi Động');
                logToConsole('error', 'Lỗi: ' + data.error);
                botRunning = false;
            }
        } catch (error) {
            updateBotStatus('offline', 'Lỗi Server');
            logToConsole('error', 'Lỗi kết nối: ' + error.message);
            botRunning = false;
        }
    }

    async function stopBot() {
        updateBotStatus('loading', 'Đang dừng...');
        try {
            await fetch('/api/bot/stop', { method: 'POST' });
        } catch (error) { }

        setTimeout(() => {
            botRunning = false;
            botStartTime = null;
            updateBotStatus('offline', 'Đang Tắt');
            startBotBtn.style.display = 'flex';
            stopBotBtn.style.display = 'none';
            logToConsole('info', '⏹️ Bot đã dừng.');
            stopUptimeCounter();
            stopLogPolling();
        }, 1000);
    }

    function updateBotStatus(status, text) {
        statusIndicator.className = 'status-indicator ' + status;
        statusText.textContent = text;
        statusText.className = 'status-text ' + status;
    }

    function startUptimeCounter() {
        uptimeInterval = setInterval(() => {
            if (botStartTime) {
                const diff = Math.floor((new Date() - botStartTime) / 1000);
                const hours = Math.floor(diff / 3600).toString().padStart(2, '0');
                const minutes = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
                const seconds = (diff % 60).toString().padStart(2, '0');
                document.getElementById('statUptime').textContent = `${hours}:${minutes}:${seconds}`;
            }
        }, 1000);
    }

    function stopUptimeCounter() {
        if (uptimeInterval) {
            clearInterval(uptimeInterval);
            uptimeInterval = null;
        }
    }

    // ==================== CONSOLE ====================
    function logToConsole(type, message) {
        const time = new Date().toLocaleTimeString('vi-VN');
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        line.innerHTML = `
            <span class="console-time">${time}</span>
            <span class="console-msg">${message}</span>
        `;
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    clearConsoleBtn?.addEventListener('click', () => {
        consoleOutput.innerHTML = '';
        logToConsole('info', 'Console đã được xóa.');
    });

    copyConsoleBtn?.addEventListener('click', () => {
        const text = Array.from(consoleOutput.querySelectorAll('.console-line'))
            .map(line => `${line.querySelector('.console-time').textContent} ${line.querySelector('.console-msg').textContent}`)
            .join('\n');
        navigator.clipboard.writeText(text).then(() => {
            showToast('✅', 'Đã copy log!');
        });
    });

    // ==================== QUICK COMMAND ====================
    sendCommandBtn?.addEventListener('click', () => sendQuickCommand());
    quickCommandInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendQuickCommand();
    });

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            quickCommandInput.value = btn.getAttribute('data-cmd');
            quickCommandInput.focus();
        });
    });

    function sendQuickCommand() {
        const cmd = quickCommandInput.value.trim();
        if (!cmd) return;

        if (!botRunning) {
            showToast('⚠️', 'Bot chưa chạy! Hãy nhấn "Chạy Bot" trước.');
            return;
        }

        logToConsole('info', `📤 Gửi lệnh: ${cmd}`);
        quickCommandInput.value = '';
        tasksCompleted++;
        document.getElementById('statTasks').textContent = tasksCompleted;

        // Simulate response
        setTimeout(() => {
            logToConsole('info', '🤔 Đang xử lý...');
        }, 500);

        setTimeout(() => {
            logToConsole('success', '✅ Đã nhận lệnh và bắt đầu thực hiện.');
            logToConsole('info', '📝 Chi tiết: ' + cmd.substring(0, 50) + '...');
        }, 1500);
    }

    // ==================== SCRIPTS ====================
    function loadScripts() {
        const saved = localStorage.getItem('moltbot_scripts');
        if (saved) {
            scripts = JSON.parse(saved);
        }
        renderScriptsList();
    }

    function saveScripts() {
        localStorage.setItem('moltbot_scripts', JSON.stringify(scripts));
        document.getElementById('statScripts').textContent = scripts.length;
    }

    function renderScriptsList() {
        if (scripts.length === 0) {
            scriptsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📜</div>
                    <div class="empty-state-text">Chưa có kịch bản nào</div>
                    <div class="empty-state-hint">Nhấn "Tạo kịch bản mới" để bắt đầu</div>
                </div>
            `;
            return;
        }

        scriptsList.innerHTML = scripts.map((script, index) => `
            <div class="script-item" data-id="${index}">
                <div class="script-info">
                    <div class="script-name">${script.name || 'Kịch bản không tên'}</div>
                    <div class="script-trigger">${getTriggerLabel(script.trigger)}</div>
                </div>
                <div class="script-actions">
                    <button class="btn btn-sm btn-primary run-script-btn" data-id="${index}">▶️ Chạy</button>
                    <button class="btn btn-sm btn-secondary edit-script-btn" data-id="${index}">✏️</button>
                    <button class="btn btn-sm btn-secondary delete-script-btn" data-id="${index}">🗑️</button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        scriptsList.querySelectorAll('.run-script-btn').forEach(btn => {
            btn.addEventListener('click', () => runScript(parseInt(btn.dataset.id)));
        });
        scriptsList.querySelectorAll('.edit-script-btn').forEach(btn => {
            btn.addEventListener('click', () => editScript(parseInt(btn.dataset.id)));
        });
        scriptsList.querySelectorAll('.delete-script-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteScript(parseInt(btn.dataset.id)));
        });

        document.getElementById('statScripts').textContent = scripts.length;
    }

    function getTriggerLabel(trigger) {
        const labels = {
            'manual': '🖱️ Chạy thủ công',
            'startup': '🚀 Khi khởi động',
            'schedule': '⏰ Theo lịch',
            'message': '💬 Khi nhận tin nhắn'
        };
        return labels[trigger] || trigger;
    }

    newScriptBtn?.addEventListener('click', () => {
        editingScriptId = null;
        document.getElementById('scriptName').value = '';
        document.getElementById('scriptTrigger').value = 'manual';
        document.getElementById('scriptContent').value = '';
        document.getElementById('scriptCron')?.value && (document.getElementById('scriptCron').value = '');
        document.getElementById('scriptKeyword')?.value && (document.getElementById('scriptKeyword').value = '');
        scriptEditorCard.style.display = 'block';
        updateTriggerConfig();
    });

    closeEditorBtn?.addEventListener('click', () => {
        scriptEditorCard.style.display = 'none';
        editingScriptId = null;
    });

    scriptTrigger?.addEventListener('change', updateTriggerConfig);

    function updateTriggerConfig() {
        const trigger = document.getElementById('scriptTrigger').value;
        document.querySelector('.schedule-config').style.display = trigger === 'schedule' ? 'block' : 'none';
        document.querySelector('.message-config').style.display = trigger === 'message' ? 'block' : 'none';
    }

    saveScriptBtn?.addEventListener('click', () => {
        const name = document.getElementById('scriptName').value.trim();
        const trigger = document.getElementById('scriptTrigger').value;
        const content = document.getElementById('scriptContent').value.trim();

        if (!name) {
            showToast('⚠️', 'Vui lòng nhập tên kịch bản');
            return;
        }
        if (!content) {
            showToast('⚠️', 'Vui lòng nhập nội dung kịch bản');
            return;
        }

        const script = {
            name,
            trigger,
            content,
            cron: document.getElementById('scriptCron')?.value || '',
            keyword: document.getElementById('scriptKeyword')?.value || '',
            createdAt: new Date().toISOString()
        };

        if (editingScriptId !== null) {
            scripts[editingScriptId] = script;
            showToast('✅', 'Đã cập nhật kịch bản!');
        } else {
            scripts.push(script);
            showToast('✅', 'Đã tạo kịch bản mới!');
        }

        saveScripts();
        renderScriptsList();
        scriptEditorCard.style.display = 'none';
        editingScriptId = null;
    });

    runScriptBtn?.addEventListener('click', () => {
        const content = document.getElementById('scriptContent').value.trim();
        if (!content) {
            showToast('⚠️', 'Kịch bản trống');
            return;
        }

        if (!botRunning) {
            showToast('⚠️', 'Bot chưa chạy! Hãy nhấn "Chạy Bot" trước.');
            return;
        }

        logToConsole('info', `📜 Chạy kịch bản: ${document.getElementById('scriptName').value || 'Không tên'}`);
        logToConsole('info', '📋 Nội dung: ' + content.split('\n')[0] + '...');

        setTimeout(() => {
            logToConsole('success', '✅ Kịch bản đang được thực thi...');
            tasksCompleted++;
            document.getElementById('statTasks').textContent = tasksCompleted;
        }, 1000);

        showToast('🚀', 'Đang chạy kịch bản...');
    });

    function editScript(id) {
        const script = scripts[id];
        if (!script) return;

        editingScriptId = id;
        document.getElementById('scriptName').value = script.name;
        document.getElementById('scriptTrigger').value = script.trigger;
        document.getElementById('scriptContent').value = script.content;
        if (document.getElementById('scriptCron')) {
            document.getElementById('scriptCron').value = script.cron || '';
        }
        if (document.getElementById('scriptKeyword')) {
            document.getElementById('scriptKeyword').value = script.keyword || '';
        }
        scriptEditorCard.style.display = 'block';
        updateTriggerConfig();
    }

    function deleteScript(id) {
        if (confirm('Bạn có chắc muốn xóa kịch bản này?')) {
            scripts.splice(id, 1);
            saveScripts();
            renderScriptsList();
            showToast('🗑️', 'Đã xóa kịch bản');
        }
    }

    function runScript(id) {
        const script = scripts[id];
        if (!script) return;

        if (!botRunning) {
            showToast('⚠️', 'Bot chưa chạy! Hãy nhấn "Chạy Bot" trước.');
            return;
        }

        logToConsole('info', `📜 Chạy kịch bản: ${script.name}`);
        logToConsole('info', '📋 ' + script.content.split('\n')[0] + '...');

        setTimeout(() => {
            logToConsole('success', '✅ Kịch bản đang được thực thi...');
            tasksCompleted++;
            document.getElementById('statTasks').textContent = tasksCompleted;
        }, 1000);

        showToast('🚀', `Đang chạy: ${script.name}`);
    }

    // Example scripts
    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const exampleKey = btn.getAttribute('data-example');
            if (exampleScripts[exampleKey]) {
                document.getElementById('scriptContent').value = exampleScripts[exampleKey];
                showToast('📋', 'Đã tải kịch bản mẫu');
            }
        });
    });

    // Toolbar buttons
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const insert = btn.getAttribute('data-insert');
            const textarea = document.getElementById('scriptContent');
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            textarea.value = text.substring(0, start) + insert + text.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + insert.length;
            textarea.focus();
        });
    });

    // ==================== PASSWORD TOGGLE ====================
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.parentElement.querySelector('input');
            if (input.type === 'password') {
                input.type = 'text';
                btn.textContent = '🙈';
            } else {
                input.type = 'password';
                btn.textContent = '👁️';
            }
        });
    });

    // ==================== GENERATE TOKEN ====================
    document.getElementById('generateToken')?.addEventListener('click', () => {
        const token = Array.from(crypto.getRandomValues(new Uint8Array(24)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        document.getElementById('gatewayToken').value = token;
        showToast('🔑', 'Đã tạo token mới!');
    });

    // ==================== EXPORT/IMPORT ====================
    exportBtn?.addEventListener('click', () => {
        const config = buildConfig();
        const blob = new Blob([JSON.stringify(config, null, 4)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'openclaw.json';
        a.click();
        URL.revokeObjectURL(url);
        showToast('💾', 'Đã xuất file config!');
    });

    importBtn?.addEventListener('click', () => importFile.click());

    importFile?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const config = JSON.parse(event.target.result);
                currentConfig = config;
                applyConfig(config);
                showToast('📂', 'Đã nhập file config!');
            } catch (error) {
                showToast('❌', 'File không hợp lệ!');
            }
        };
        reader.readAsText(file);
    });

    function buildConfig() {
        return {
            providers: {
                moonshot: {
                    baseUrl: document.getElementById('moonshotBaseUrl')?.value || 'https://api.moonshot.cn/v1',
                    apiKey: '${MOONSHOT_API_KEY}',
                    api: 'openai'
                },
                "google-antigravity": {
                    baseUrl: document.getElementById('googleProxyUrl')?.value || "https://generativelanguage.googleapis.com/v1beta",
                    api: "google",
                    models: [
                        { id: "gemini-3-pro-high", name: "Gemini 3 Pro (High)", contextWindow: 2000000, maxTokens: 8192 },
                        { id: "gemini-3-pro-low", name: "Gemini 3 Pro (Low)", contextWindow: 2000000, maxTokens: 8192 },
                        { id: "gemini-3-flash", name: "Gemini 3 Flash", contextWindow: 1000000, maxTokens: 8192 },
                        { id: "claude-sonnet-4.5", name: "Claude Sonnet 4.5", contextWindow: 200000, maxTokens: 8192 },
                        { id: "claude-sonnet-4.5-thinking", name: "Claude Sonnet 4.5 (Thinking)", contextWindow: 200000, maxTokens: 8192 },
                        { id: "claude-opus-4.5-thinking", name: "Claude Opus 4.5 (Thinking)", contextWindow: 200000, maxTokens: 8192 }
                    ]
                }
            },
            agents: {
                systemPrompt: document.getElementById('systemPrompt')?.value || '',
                defaults: {
                    description: document.getElementById('systemPrompt')?.value || '',
                    model: {
                        primary: document.getElementById('primaryModel')?.value || 'moonshot/kimi-k2.5'
                    },
                    models: {
                        [document.getElementById('primaryModel')?.value || 'moonshot/kimi-k2.5']: {},
                        "moonshot/kimi-k2.5": {},
                        "google-antigravity/gemini-3-flash": {},
                        "google-antigravity/claude-sonnet-4.5": {}
                    },
                    maxConcurrent: parseInt(document.getElementById('maxConcurrent')?.value) || 4,
                    subagentsConcurrent: parseInt(document.getElementById('subagentsConcurrent')?.value) || 8,
                    memory: {
                        enabled: document.getElementById('memoryEnabled')?.checked ?? true,
                        maxTokens: parseInt(document.getElementById('memoryMaxTokens')?.value) || 100000
                    },
                    reasoning: {
                        enabled: document.getElementById('reasoningEnabled')?.checked ?? true,
                        depth: document.getElementById('reasoningDepth')?.value || 'deep'
                    }
                }
            },
            gateway: {
                mode: document.getElementById('gatewayMode')?.value || 'local',
                port: parseInt(document.getElementById('gatewayPort')?.value) || 18789,
                token: '${OPENCLAW_GATEWAY_TOKEN}'
            },
            plugins: {
                entries: {
                    telegram: { enabled: document.getElementById('pluginTelegram')?.checked ?? true },
                    browser: {
                        enabled: document.getElementById('pluginBrowser')?.checked ?? true,
                        headless: document.getElementById('browserHeadless')?.checked ?? true
                    },
                    scheduler: { enabled: document.getElementById('pluginScheduler')?.checked ?? true }
                }
            },
            security: {
                maxRequestsPerMinute: parseInt(document.getElementById('maxRequests')?.value) || 60,
                allowShellCommands: document.getElementById('allowShellCommands')?.checked ?? true,
                allowFileAccess: document.getElementById('allowFileAccess')?.checked ?? true,
                allowEmail: document.getElementById('allowEmail')?.checked ?? false,
                allowInternet: document.getElementById('allowInternet')?.checked ?? true,
                allowScreenCapture: document.getElementById('allowScreenCapture')?.checked ?? true,
                allowCamera: document.getElementById('allowCamera')?.checked ?? false,
                allowMicrophone: document.getElementById('allowMicrophone')?.checked ?? false,
                allowAudioOutput: document.getElementById('allowAudioOutput')?.checked ?? true,
                allowClipboard: document.getElementById('allowClipboard')?.checked ?? true,
                allowNotifications: document.getElementById('allowNotifications')?.checked ?? true,
                allowLocation: document.getElementById('allowLocation')?.checked ?? false,
                allowPayments: document.getElementById('allowPayments')?.checked ?? false,
                allowBluetooth: document.getElementById('allowBluetooth')?.checked ?? false,
                allowUSB: document.getElementById('allowUSB')?.checked ?? false
            },
            logging: {
                level: document.getElementById('logLevel')?.value || 'info',
                file: document.getElementById('logFile')?.value || './logs/openclaw.log',
                console: document.getElementById('logConsole')?.checked ?? true
            },
            scripts: scripts
        };
    }

    function applyConfig(config) {
        // Model
        if (config.agents?.defaults?.model?.primary) {
            const el = document.getElementById('primaryModel');
            if (el) el.value = config.agents.defaults.model.primary;
            document.getElementById('statModel').textContent = config.agents.defaults.model.primary.split('/').pop();
        }

        // Gateway
        if (config.gateway) {
            if (document.getElementById('gatewayMode')) document.getElementById('gatewayMode').value = config.gateway.mode || 'local';
            if (document.getElementById('gatewayPort')) document.getElementById('gatewayPort').value = config.gateway.port || 18789;
        }

        // Agents
        if (config.agents) {
            if (document.getElementById('systemPrompt')) document.getElementById('systemPrompt').value = config.agents.systemPrompt || '';

            if (config.agents.defaults) {
                if (document.getElementById('maxConcurrent')) document.getElementById('maxConcurrent').value = config.agents.defaults.maxConcurrent || 4;
                if (document.getElementById('subagentsConcurrent')) document.getElementById('subagentsConcurrent').value = config.agents.defaults.subagentsConcurrent || 8;
                if (document.getElementById('memoryEnabled')) document.getElementById('memoryEnabled').checked = config.agents.defaults.memory?.enabled ?? true;
                if (document.getElementById('memoryMaxTokens')) {
                    const val = config.agents.defaults.memory?.maxTokens || 100000;
                    document.getElementById('memoryMaxTokens').value = val;
                    document.getElementById('memoryValueLabel').textContent = (val / 1000) + 'k tokens';
                }
                if (document.getElementById('reasoningEnabled')) document.getElementById('reasoningEnabled').checked = config.agents.defaults.reasoning?.enabled ?? true;
                if (document.getElementById('reasoningDepth')) document.getElementById('reasoningDepth').value = config.agents.defaults.reasoning?.depth || 'deep';
            }
        }

        // Plugins
        if (config.plugins?.entries) {
            if (document.getElementById('pluginTelegram')) document.getElementById('pluginTelegram').checked = config.plugins.entries.telegram?.enabled ?? true;
            if (document.getElementById('pluginBrowser')) document.getElementById('pluginBrowser').checked = config.plugins.entries.browser?.enabled ?? true;
            if (document.getElementById('pluginScheduler')) document.getElementById('pluginScheduler').checked = config.plugins.entries.scheduler?.enabled ?? true;
            if (document.getElementById('browserHeadless')) document.getElementById('browserHeadless').checked = config.plugins.entries.browser?.headless ?? true;
        }

        // Security
        if (config.security) {
            if (document.getElementById('maxRequests')) document.getElementById('maxRequests').value = config.security.maxRequestsPerMinute || 60;
            if (document.getElementById('allowShellCommands')) document.getElementById('allowShellCommands').checked = config.security.allowShellCommands ?? true;
            if (document.getElementById('allowFileAccess')) document.getElementById('allowFileAccess').checked = config.security.allowFileAccess ?? true;
            if (document.getElementById('allowEmail')) document.getElementById('allowEmail').checked = config.security.allowEmail ?? false;
        }

        // Logging
        if (config.logging) {
            if (document.getElementById('logLevel')) document.getElementById('logLevel').value = config.logging.level || 'info';
            if (document.getElementById('logFile')) document.getElementById('logFile').value = config.logging.file || './logs/openclaw.log';
            if (document.getElementById('logConsole')) document.getElementById('logConsole').checked = config.logging.console ?? true;
        }

        // Scripts
        if (config.scripts) {
            scripts = config.scripts;
            renderScriptsList();
        }
    }

    // ==================== LOGGING ====================
    let logPollInterval = null;
    let lastLogTime = 0;

    function startLogPolling() {
        if (logPollInterval) clearInterval(logPollInterval);
        logPollInterval = setInterval(fetchLogs, 1000);
    }

    function stopLogPolling() {
        if (logPollInterval) clearInterval(logPollInterval);
        logPollInterval = null;
    }

    async function fetchLogs() {
        try {
            const res = await fetch(`/api/logs?after=${lastLogTime}`);
            const data = await res.json();
            if (data.success && data.logs && data.logs.length > 0) {
                data.logs.forEach(log => {
                    logToConsole(log.type, log.message);
                    lastLogTime = Math.max(lastLogTime, log.timestamp);
                });
            }
        } catch (e) { }
    }

    // ==================== TOAST ====================
    function showToast(icon, message) {
        toast.querySelector('.toast-icon').textContent = icon;
        toast.querySelector('.toast-message').textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // ==================== INIT ====================
    async function init() {
        // Load scripts from localStorage
        loadScripts();

        // Try to load config from server
        try {
            const response = await fetch('/api/config');
            const data = await response.json();
            // API returns raw config object, not {success, config} wrapper
            if (data && data.agents) {
                currentConfig = data;
                applyConfig(data);
                logToConsole('success', '✅ Đã tải cấu hình thành công');

                // Update model stat card
                if (data.agents?.defaults?.model?.primary) {
                    const model = data.agents.defaults.model.primary;
                    document.getElementById('statModel').textContent = model.split('/').pop();
                }
            } else if (data.error) {
                logToConsole('warning', `⚠️ ${data.error}`);
            }
        } catch (error) {
            logToConsole('info', 'ℹ️ Chạy locally - config sẽ được lưu vào file');
            document.getElementById('statModel').textContent = 'Chưa kết nối';
        }
    }

    let lastBotStatus = null; // Track previous status to avoid log spam
    async function checkBotStatus() {
        try {
            const res = await fetch('/api/status');
            const data = await res.json();
            const isRunning = data.success && data.status.botRunning;

            if (isRunning) {
                document.getElementById('startBotBtn').disabled = true;
                document.getElementById('startBotBtn').innerHTML = '✅ Đang chạy';
                document.getElementById('stopBotBtn').disabled = false;
                // Only log on status change to avoid spam
                if (lastBotStatus !== true) {
                    logToConsole('info', 'ℹ️ Bot đang chạy');
                }
            } else {
                document.getElementById('startBotBtn').disabled = false;
                document.getElementById('startBotBtn').innerHTML = '🚀 Chạy Bot';
                document.getElementById('stopBotBtn').disabled = false;
                if (lastBotStatus !== false && lastBotStatus !== null) {
                    logToConsole('info', 'ℹ️ Bot đã dừng');
                }
            }
            lastBotStatus = isRunning;
        } catch (e) {
            console.error('Status check error:', e);
        }
    }

    // Check status periodically
    setInterval(checkBotStatus, 5000);

    // Initial check
    checkAuthStatus();
    init().then(() => checkBotStatus());
});
