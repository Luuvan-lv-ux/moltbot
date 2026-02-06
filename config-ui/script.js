/**
 * MOLTBOT CONFIG UI - JavaScript
 * Xử lý logic cho giao diện cấu hình
 */

// ============================================================================
// NAVIGATION
// ============================================================================

const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.config-section');
const sectionTitle = document.getElementById('sectionTitle');
const sectionDesc = document.getElementById('sectionDesc');

const sectionInfo = {
    model: { title: 'Cấu hình Model AI', desc: 'Chọn và cấu hình các model AI cho bot của bạn' },
    telegram: { title: 'Cấu hình Telegram', desc: 'Kết nối bot với Telegram' },
    gateway: { title: 'Gateway Settings', desc: 'Cấu hình cổng kết nối OpenClaw' },
    agents: { title: 'Cài đặt Agent', desc: 'Điều chỉnh hành vi của AI agent' },
    plugins: { title: 'Plugins', desc: 'Bật/tắt các plugin mở rộng' },
    skills: { title: 'Skills', desc: 'Quản lý các skill của bot' },
    security: { title: 'Bảo mật', desc: 'Cấu hình an toàn và giới hạn' },
    logging: { title: 'Logging', desc: 'Cấu hình ghi log' }
};

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = item.dataset.section;

        // Update nav
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        // Update section
        sections.forEach(section => section.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');

        // Update header
        const info = sectionInfo[sectionId];
        sectionTitle.textContent = info.title;
        sectionDesc.textContent = info.desc;
    });
});

// ============================================================================
// PASSWORD TOGGLE
// ============================================================================

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

// ============================================================================
// TOKEN GENERATOR
// ============================================================================

document.getElementById('generateToken').addEventListener('click', () => {
    const chars = 'abcdef0123456789';
    let token = '';
    for (let i = 0; i < 48; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('gatewayToken').value = token;
    showToast('✅', 'Đã tạo token mới!');
});

// ============================================================================
// EXPORT CONFIG
// ============================================================================

document.getElementById('exportBtn').addEventListener('click', () => {
    const config = buildConfig();
    const blob = new Blob([JSON.stringify(config, null, 4)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'openclaw.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('💾', 'Đã xuất file openclaw.json!');
});

function buildConfig() {
    return {
        messages: {
            ackReactionScope: "group-mentions"
        },
        agents: {
            defaults: {
                maxConcurrent: parseInt(document.getElementById('maxConcurrent').value),
                skipBootstrap: document.getElementById('skipBootstrap').checked,
                bootstrapMaxChars: parseInt(document.getElementById('bootstrapMaxChars').value),
                subagents: {
                    maxConcurrent: parseInt(document.getElementById('subagentsConcurrent').value)
                },
                compaction: {
                    mode: document.getElementById('compactionMode').value
                },
                workspace: document.getElementById('workspace').value,
                model: {
                    primary: document.getElementById('primaryModel').value
                },
                memory: {
                    enabled: document.getElementById('memoryEnabled').checked,
                    maxTokens: parseInt(document.getElementById('memoryMaxTokens').value)
                },
                reasoning: {
                    enabled: document.getElementById('reasoningEnabled').checked,
                    depth: document.getElementById('reasoningDepth').value
                }
            }
        },
        models: {
            mode: "merge",
            providers: {
                moonshot: {
                    baseUrl: document.getElementById('moonshotBaseUrl').value,
                    apiKey: "${MOONSHOT_API_KEY}",
                    api: "openai",
                    models: [
                        {
                            id: "kimi-k2.5",
                            name: "Kimi K2.5 (Mới nhất - Multimodal)",
                            reasoning: true,
                            input: ["text", "image"],
                            contextWindow: 256000,
                            maxTokens: 8192
                        },
                        {
                            id: "kimi-k2-0905-Preview",
                            name: "Kimi K2 0905 Preview (Agentic)",
                            reasoning: true,
                            input: ["text", "image"],
                            contextWindow: 256000,
                            maxTokens: 8192
                        },
                        {
                            id: "kimi-k2-turbo-preview",
                            name: "Kimi K2 Turbo (Nhanh)",
                            reasoning: true,
                            input: ["text"],
                            contextWindow: 256000,
                            maxTokens: 8192
                        },
                        {
                            id: "kimi-k2-thinking",
                            name: "Kimi K2 Thinking (Suy luận sâu)",
                            reasoning: true,
                            input: ["text"],
                            contextWindow: 256000,
                            maxTokens: 16384
                        },
                        {
                            id: "kimi-k2-thinking-turbo",
                            name: "Kimi K2 Thinking Turbo",
                            reasoning: true,
                            input: ["text"],
                            contextWindow: 256000,
                            maxTokens: 16384
                        },
                        {
                            id: "moonshot-v1-128k",
                            name: "Moonshot V1 128K (Cũ)",
                            reasoning: false,
                            input: ["text"],
                            contextWindow: 128000,
                            maxTokens: 4096
                        }
                    ]
                },
                google: {
                    baseUrl: document.getElementById('googleProxyUrl').value,
                    apiKey: "managed_by_proxy",
                    api: "google",
                    models: [
                        {
                            id: "models/gemma-3-27b-it",
                            name: "Gemma 3 27B IT",
                            reasoning: true,
                            input: ["text", "image"],
                            contextWindow: 128000,
                            maxTokens: 8192
                        }
                    ]
                }
            }
        },
        gateway: {
            mode: document.getElementById('gatewayMode').value,
            auth: {
                mode: "token",
                token: "${OPENCLAW_GATEWAY_TOKEN}"
            },
            port: "${OPENCLAW_GATEWAY_PORT}",
            bind: document.getElementById('gatewayBind').value,
            tailscale: {
                mode: "off",
                resetOnExit: false
            }
        },
        plugins: {
            entries: {
                telegram: {
                    enabled: document.getElementById('pluginTelegram').checked
                },
                browser: {
                    enabled: document.getElementById('pluginBrowser').checked,
                    headless: document.getElementById('browserHeadless').checked
                },
                scheduler: {
                    enabled: document.getElementById('pluginScheduler').checked
                }
            }
        },
        channels: {
            telegram: {
                enabled: document.getElementById('telegramEnabled').checked,
                botToken: "${TELEGRAM_BOT_TOKEN}",
                allowedUsers: parseList(document.getElementById('telegramAllowedUsers').value),
                adminUsers: parseList(document.getElementById('telegramAdminUsers').value)
            }
        },
        skills: {
            install: {
                nodeManager: document.getElementById('nodeManager').value
            },
            autoload: document.getElementById('autoloadSkills').checked,
            directory: document.getElementById('skillsDirectory').value
        },
        logging: {
            level: document.getElementById('logLevel').value,
            file: document.getElementById('logFile').value,
            console: document.getElementById('logConsole').checked
        },
        security: {
            maxRequestsPerMinute: parseInt(document.getElementById('maxRequests').value),
            allowShellCommands: document.getElementById('allowShellCommands').checked,
            allowFileAccess: document.getElementById('allowFileAccess').checked
        }
    };
}

function parseList(str) {
    if (!str || !str.trim()) return [];
    return str.split(',').map(s => s.trim()).filter(s => s);
}

// ============================================================================
// IMPORT CONFIG
// ============================================================================

document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const config = JSON.parse(event.target.result);
            loadConfig(config);
            showToast('📂', 'Đã nhập cấu hình thành công!');
        } catch (err) {
            showToast('❌', 'File không hợp lệ!');
        }
    };
    reader.readAsText(file);
});

function loadConfig(config) {
    // Model
    if (config.agents?.defaults?.model?.primary) {
        document.getElementById('primaryModel').value = config.agents.defaults.model.primary;
    }

    // Moonshot
    if (config.models?.providers?.moonshot?.baseUrl) {
        document.getElementById('moonshotBaseUrl').value = config.models.providers.moonshot.baseUrl;
    }

    // Google
    if (config.models?.providers?.google?.baseUrl) {
        document.getElementById('googleProxyUrl').value = config.models.providers.google.baseUrl;
    }

    // Telegram
    if (config.channels?.telegram) {
        document.getElementById('telegramEnabled').checked = config.channels.telegram.enabled ?? true;
        if (config.channels.telegram.allowedUsers) {
            document.getElementById('telegramAllowedUsers').value = config.channels.telegram.allowedUsers.join(', ');
        }
        if (config.channels.telegram.adminUsers) {
            document.getElementById('telegramAdminUsers').value = config.channels.telegram.adminUsers.join(', ');
        }
    }

    // Gateway
    if (config.gateway) {
        document.getElementById('gatewayMode').value = config.gateway.mode || 'local';
        document.getElementById('gatewayBind').value = config.gateway.bind || 'loopback';
    }

    // Agents
    if (config.agents?.defaults) {
        const d = config.agents.defaults;
        document.getElementById('maxConcurrent').value = d.maxConcurrent ?? 4;
        document.getElementById('subagentsConcurrent').value = d.subagents?.maxConcurrent ?? 8;
        document.getElementById('skipBootstrap').checked = d.skipBootstrap ?? false;
        document.getElementById('bootstrapMaxChars').value = d.bootstrapMaxChars ?? 4000;
        document.getElementById('compactionMode').value = d.compaction?.mode ?? 'safeguard';
        document.getElementById('workspace').value = d.workspace ?? '/home/openclaw/workspace';

        if (d.memory) {
            document.getElementById('memoryEnabled').checked = d.memory.enabled ?? true;
            document.getElementById('memoryMaxTokens').value = d.memory.maxTokens ?? 100000;
        }
        if (d.reasoning) {
            document.getElementById('reasoningEnabled').checked = d.reasoning.enabled ?? true;
            document.getElementById('reasoningDepth').value = d.reasoning.depth ?? 'deep';
        }
    }

    // Plugins
    if (config.plugins?.entries) {
        document.getElementById('pluginTelegram').checked = config.plugins.entries.telegram?.enabled ?? true;
        document.getElementById('pluginBrowser').checked = config.plugins.entries.browser?.enabled ?? true;
        document.getElementById('pluginScheduler').checked = config.plugins.entries.scheduler?.enabled ?? true;
        document.getElementById('browserHeadless').checked = config.plugins.entries.browser?.headless ?? true;
    }

    // Skills
    if (config.skills) {
        document.getElementById('skillsDirectory').value = config.skills.directory ?? './skills';
        document.getElementById('nodeManager').value = config.skills.install?.nodeManager ?? 'npm';
        document.getElementById('autoloadSkills').checked = config.skills.autoload ?? true;
    }

    // Security
    if (config.security) {
        document.getElementById('maxRequests').value = config.security.maxRequestsPerMinute ?? 60;
        document.getElementById('allowShellCommands').checked = config.security.allowShellCommands ?? true;
        document.getElementById('allowFileAccess').checked = config.security.allowFileAccess ?? true;
    }

    // Logging
    if (config.logging) {
        document.getElementById('logLevel').value = config.logging.level ?? 'info';
        document.getElementById('logFile').value = config.logging.file ?? './logs/openclaw.log';
        document.getElementById('logConsole').checked = config.logging.console ?? true;
    }
}

// ============================================================================
// TOAST NOTIFICATION
// ============================================================================

function showToast(icon, message) {
    const toast = document.getElementById('toast');
    toast.querySelector('.toast-icon').textContent = icon;
    toast.querySelector('.toast-message').textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================================================
// BROWSER PLUGIN TOGGLE
// ============================================================================

document.getElementById('pluginBrowser').addEventListener('change', (e) => {
    document.getElementById('browserSettings').style.display = e.target.checked ? 'block' : 'none';
});

// ============================================================================
// INITIALIZATION
// ============================================================================

// Load existing config if available
fetch('../openclaw.json')
    .then(res => res.json())
    .then(config => {
        loadConfig(config);
        console.log('[Config UI] Đã tải cấu hình hiện có');
    })
    .catch(() => {
        console.log('[Config UI] Không tìm thấy file cấu hình, dùng giá trị mặc định');
    });
