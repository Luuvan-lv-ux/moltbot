# 🤖 Moltbot - AI-Powered Telegram Bot

> **OpenClaw Gateway + Web UI quản lý thông minh cho Telegram Bot**

Moltbot là một Telegram bot được xây dựng trên nền tảng OpenClaw Gateway, hỗ trợ nhiều AI model từ Google Antigravity và Moonshot AI. Giao diện web hiện đại giúp quản lý cấu hình, model selection, và monitoring bot một cách dễ dàng.

![Moltbot Banner](https://img.shields.io/badge/OpenClaw-2026.2.3-blue) ![Node.js](https://img.shields.io/badge/Node.js-18%2B-green) ![License](https://img.shields.io/badge/license-MIT-orange)

---

## ✨ Tính Năng Chính

### 🎯 Core Features
- **Multi-Model Support**: Gemini 3, Claude Opus/Sonnet, Moonshot Kimi
- **Web UI Dashboard**: Quản lý bot qua giao diện web hiện đại
- **Real-time Console**: Theo dõi logs và trạng thái bot trực tiếp
- **Model Switching**: Chuyển đổi AI model linh hoạt qua UI
- **Auto-Sync Config**: Tự động đồng bộ cấu hình giữa UI và OpenClaw

### 🛠️ Technical Features
- OpenClaw Gateway integration
- Telegram Bot API
- Multi-provider AI routing (Google Antigravity Proxy)
- Browser automation support
- Task scheduling
- Security controls

---

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **OpenClaw CLI**: >= 2026.2.3
- **OS**: Windows 10/11, Linux, macOS
- **RAM**: 2GB+ recommended
- **Network**: Stable internet connection

---

## 🚀 Cài Đặt Nhanh

### 1️⃣ Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/moltbot.git
cd moltbot
```

### 2️⃣ Cài Đặt Dependencies

```bash
npm install
```

### 3️⃣ Cài Đặt OpenClaw CLI

**Windows (PowerShell):**
```powershell
npm install -g @google/openclaw
```

**Linux/macOS:**
```bash
sudo npm install -g @google/openclaw
```

Verify installation:
```bash
openclaw --version
```

### 4️⃣ Cấu Hình Environment Variables

Tạo file `.env` tại thư mục gốc:

```env
# Telegram Bot Token (bắt buộc)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Moonshot API Key (tùy chọn, nếu dùng Kimi models)
MOONSHOT_API_KEY=your_moonshot_api_key_here

# OpenClaw Gateway Token (được tạo tự động, có thể để trống)
OPENCLAW_GATEWAY_TOKEN=
```

**Hướng dẫn lấy tokens:**
- **Telegram Bot Token**: Chat với [@BotFather](https://t.me/BotFather) trên Telegram → `/newbot`
- **Moonshot API Key**: Đăng ký tại [moonshot.cn](https://platform.moonshot.cn/)

### 5️⃣ Cấu Hình OpenClaw

**Đăng nhập Google Account:**
```bash
openclaw auth login
```

Làm theo hướng dẫn để xác thực với Google Account. OpenClaw sẽ tự động cấu hình proxy cho Gemini models.

### 6️⃣ Chạy Bot

**Khởi động Config Server (Web UI):**
```bash
npm run config
```

Server sẽ chạy tại `http://localhost:8080`

**Mở trình duyệt** và truy cập:
```
http://localhost:8080
```

**Trong Web UI:**
1. Vào tab **"Model AI"**
2. Chọn model muốn sử dụng (ví dụ: Gemini 3 Flash)
3. Nhấn **"🚀 Chạy Bot"**
4. Kiểm tra Console Log để xác nhận bot đã khởi động

**Test bot trên Telegram:**
- Tìm bot của bạn trên Telegram
- Gửi tin nhắn: `Xin chào!`
- Bot sẽ phản hồi bằng AI model đã chọn

---

## 📁 Cấu Trúc Project

```
moltbot/
├── config-ui/              # Web UI source
│   ├── index.html         # Main dashboard
│   ├── script.js          # UI logic
│   └── styles.css         # Styling
├── config-server.js       # Express server for UI
├── config.json            # Bot configuration (auto-generated)
├── package.json           # NPM dependencies
├── .env                   # Environment variables (create this)
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

---

## 🎨 Sử Dụng Web UI

### Dashboard Overview

![Dashboard](./docs/dashboard.png)

**Các tab chính:**
- **Bảng Điều Khiển**: Overview và stats
- **Model AI**: Chọn và cấu hình AI models
- **Telegram**: Cấu hình Telegram bot token
- **Gateway**: Cài đặt OpenClaw Gateway
- **Agents**: Cấu hình agent behavior
- **Logging**: Quản lý logs

### Model Selection

1. Mở tab **"Model AI"**
2. Chọn model từ dropdown:
   - Google Antigravity: Gemini 3 Pro/Flash, Claude 4.5 Opus/Sonnet
   - Moonshot: Kimi K2.5, Kimi K2 models
3. Model sẽ được áp dụng **NGAY KHI NHẤN "Chạy Bot"** (auto-save)

### Bot Control

- **🚀 Chạy Bot**: Khởi động bot với config hiện tại
- **⏹️ Dừng Bot**: Dừng bot và release port
- **💾 Lưu Cấu Hình**: Lưu config thủ công (optional)

---

## 🔧 Troubleshooting

### Bot không khởi động được

**Lỗi: "Port 18789 is already in use"**
```bash
# Windows
taskkill /F /IM node.exe
openclaw gateway stop

# Linux/macOS
pkill -9 node
openclaw gateway stop
```

**Lỗi: "TELEGRAM_BOT_TOKEN is not set"**
- Kiểm tra file `.env` đã tạo chưa
- Verify token từ @BotFather
- Restart config server sau khi sửa `.env`

### Model không đổi sau khi chọn trong UI

**Giải pháp tạm thời:**
1. Chọn model trong UI
2. Nhấn **"💾 Lưu Cấu Hình"** TRƯỚC
3. Nhấn **"⏹️ Dừng Bot"** (nếu đang chạy)
4. Nhấn **"🚀 Chạy Bot"**
5. Kiểm tra console log: `agent model: google-antigravity/...`

**Note**: Auto-save khi chạy bot đang được fix.

### OpenClaw authentication failed

```bash
# Re-authenticate
openclaw auth logout
openclaw auth login
```

### UI bị cache (không cập nhật)

- **Ctrl + F5**: Hard refresh
- **Ctrl + Shift + Delete**: Xóa cache toàn bộ

---

## 📚 Advanced Configuration

### Custom OpenClaw Config

OpenClaw config được lưu tại:
- **Windows**: `C:\Users\USERNAME\.openclaw\openclaw.json`
- **Linux/macOS**: `~/.openclaw/openclaw.json`

Bạn có thể sửa trực tiếp file này nhưng **không khuyến khích** vì Web UI sẽ override.

### Multiple Models Setup

Trong `config.json`, bạn có thể thêm nhiều models:

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "google-antigravity/gemini-3-flash"
      },
      "models": {
        "google-antigravity/gemini-3-flash": {},
        "google-antigravity/claude-sonnet-4.5": {},
        "moonshot/kimi-k2.5": {}
      }
    }
  }
}
```

---

## 🛡️ Security Best Practices

1. **Không commit `.env`** vào Git
2. **Giới hạn quyền bot** trong `config.json`:
   ```json
   "security": {
     "allowShellCommands": false,
     "allowFileAccess": false
   }
   ```
3. **Restrict bot access** qua Telegram Bot Settings
4. **Regularly rotate** API keys

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/moltbot/issues)
- **Telegram**: [@YOUR_TELEGRAM](https://t.me/YOUR_TELEGRAM)
- **Email**: your.email@example.com

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Credits

- **OpenClaw**: Google DeepMind
- **Moonshot AI**: Kimi models
- **Telegram Bot API**: Telegram

---

## 🔄 Changelog

### v2.1.0 (Latest)
- ✨ Added Web UI dashboard
- 🎯 Model auto-save on bot start
- 🔄 Real-time status sync
- 🛠️ Improved config management

### v2.0.0
- 🚀 Initial release with OpenClaw integration

---

**Made with ❤️ by the Moltbot Team**
