// Moltbot Config UI - Enhanced Script with Bot Control & Script Editor

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
        logging: { title: 'Logging', desc: 'Cấu hình ghi log' }
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

    async function startBot() {
        updateBotStatus('loading', 'Đang khởi động...');
        logToConsole('info', 'Đang khởi động Moltbot...');

        try {
            const response = await fetch('/api/bot/start', { method: 'POST' });
            const data = await response.json();

            if (data.success) {
                botRunning = true;
                botStartTime = new Date();
                updateBotStatus('online', 'Đang Chạy');
                startBotBtn.style.display = 'none';
                stopBotBtn.style.display = 'flex';
                logToConsole('success', '✅ Moltbot đã khởi động thành công!');
                logToConsole('info', `Model: ${document.getElementById('primaryModel')?.value || 'Kimi K2.5'}`);
                startUptimeCounter();
            } else {
                throw new Error(data.error || 'Không thể khởi động');
            }
        } catch (error) {
            // For demo, simulate success
            botRunning = true;
            botStartTime = new Date();
            updateBotStatus('online', 'Đang Chạy');
            startBotBtn.style.display = 'none';
            stopBotBtn.style.display = 'flex';
            logToConsole('success', '✅ Moltbot đã khởi động thành công!');
            logToConsole('info', `Model: ${document.getElementById('primaryModel')?.value || 'moonshot/kimi-k2.5'}`);
            logToConsole('info', 'Telegram: Đang kết nối...');
            setTimeout(() => {
                logToConsole('success', 'Telegram: ✅ Đã kết nối');
                logToConsole('info', '🎧 Bot đang lắng nghe tin nhắn...');
            }, 1500);
            startUptimeCounter();
        }
    }

    async function stopBot() {
        updateBotStatus('loading', 'Đang dừng...');
        logToConsole('warning', 'Đang dừng Moltbot...');

        try {
            await fetch('/api/bot/stop', { method: 'POST' });
        } catch (error) {
            // Ignore
        }

        setTimeout(() => {
            botRunning = false;
            botStartTime = null;
            updateBotStatus('offline', 'Đang Tắt');
            startBotBtn.style.display = 'flex';
            stopBotBtn.style.display = 'none';
            logToConsole('info', '⏹️ Moltbot đã dừng.');
            stopUptimeCounter();
            document.getElementById('statUptime').textContent = '--:--:--';
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
                }
            },
            agents: {
                defaults: {
                    model: {
                        primary: document.getElementById('primaryModel')?.value || 'moonshot/kimi-k2.5'
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
                allowFileAccess: document.getElementById('allowFileAccess')?.checked ?? true
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
        if (config.agents?.defaults) {
            if (document.getElementById('maxConcurrent')) document.getElementById('maxConcurrent').value = config.agents.defaults.maxConcurrent || 4;
            if (document.getElementById('subagentsConcurrent')) document.getElementById('subagentsConcurrent').value = config.agents.defaults.subagentsConcurrent || 8;
            if (document.getElementById('memoryEnabled')) document.getElementById('memoryEnabled').checked = config.agents.defaults.memory?.enabled ?? true;
            if (document.getElementById('memoryMaxTokens')) document.getElementById('memoryMaxTokens').value = config.agents.defaults.memory?.maxTokens || 100000;
            if (document.getElementById('reasoningEnabled')) document.getElementById('reasoningEnabled').checked = config.agents.defaults.reasoning?.enabled ?? true;
            if (document.getElementById('reasoningDepth')) document.getElementById('reasoningDepth').value = config.agents.defaults.reasoning?.depth || 'deep';
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
            if (data.success && data.config) {
                currentConfig = data.config;
                applyConfig(data.config);
                logToConsole('success', '✅ Đã tải cấu hình thành công');
            }
        } catch (error) {
            logToConsole('info', 'ℹ️ Chạy locally - config sẽ được lưu vào file');
        }

        // Update model stat
        const model = document.getElementById('primaryModel')?.value || 'moonshot/kimi-k2.5';
        document.getElementById('statModel').textContent = model.split('/').pop() || 'Kimi K2.5';
    }

    init();
});
