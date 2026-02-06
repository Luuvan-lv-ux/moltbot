# 📦 Hướng Dẫn Cài Đặt Chi Tiết Moltbot

## 📌 Mục Lục
1. [Chuẩn bị môi trường](#1-chuẩn-bị-môi-trường)
2. [Cài đặt Node.js & npm](#2-cài-đặt-nodejs--npm)
3. [Cài đặt OpenClaw CLI](#3-cài-đặt-openclaw-cli)
4. [Setup Project](#4-setup-project)
5. [Cấu hình Bot](#5-cấu-hình-bot)
6. [Chạy lần đầu](#6-chạy-lần-đầu)
7. [Verify hoạt động](#7-verify-hoạt-động)

---

## 1. Chuẩn Bị Môi Trường

### Windows

**Bước 1.1: Cài đặt Windows Terminal (khuyến nghị)**
```powershell
winget install Microsoft.WindowsTerminal
```

**Bước 1.2: Mở PowerShell với quyền Admin**
- Nhấn `Win + X`
- Chọn "Windows PowerShell (Admin)" hoặc "Terminal (Admin)"

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install curl git build-essential -y
```

### macOS

```bash
# Cài Homebrew nếu chưa có
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

brew install git
```

---

## 2. Cài Đặt Node.js & npm

### Windows

**Option A: Sử dụng nvm-windows (khuyến nghị)**

1. Download [nvm-windows installer](https://github.com/coreybutler/nvm-windows/releases/latest)
2. Chạy file `.exe` và cài đặt
3. Mở PowerShell mới:

```powershell
nvm install 20
nvm use 20
node --version  # Phải hiện v20.x.x
npm --version   # Phải hiện 10.x.x
```

**Option B: Download trực tiếp**

1. Truy cập [nodejs.org](https://nodejs.org/)
2. Download phiên bản **LTS** (20.x)
3. Chạy installer, chọn "Add to PATH"
4. Restart PowerShell
5. Verify:

```powershell
node --version
npm --version
```

### Linux

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

### macOS

```bash
brew install node@20
node --version
npm --version
```

---

## 3. Cài Đặt OpenClaw CLI

OpenClaw là gateway chính của bot.

### Windows

```powershell
npm install -g @google/openclaw

# Verify
openclaw --version
# Expected: OpenClaw 2026.2.3 hoặc mới hơn
```

**Nếu gặp lỗi permissions:**
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
npm install -g @google/openclaw
```

### Linux/macOS

```bash
sudo npm install -g @google/openclaw

# Verify
openclaw --version
```

---

## 4. Setup Project

### Bước 4.1: Clone hoặc Download

**Option A: Git Clone**
```bash
cd ~/Documents  # Hoặc thư mục bạn muốn
git clone https://github.com/YOUR_USERNAME/moltbot.git
cd moltbot
```

**Option B: Download ZIP**
1. Download ZIP từ GitHub
2. Giải nén vào thư mục (ví dụ: `d:\moltbot`)
3. Mở terminal tại thư mục đó

### Bước 4.2: Cài đặt NPM Dependencies

```bash
npm install
```

**Expected output:**
```
added 150 packages in 15s
```

### Bước 4.3: Tạo file `.env`

**Windows:**
```powershell
New-Item -Path .env -ItemType File
notepad .env
```

**Linux/macOS:**
```bash
touch .env
nano .env
```

**Nội dung file `.env`:**
```env
TELEGRAM_BOT_TOKEN=
MOONSHOT_API_KEY=
OPENCLAW_GATEWAY_TOKEN=
```

**Lưu file** (Ctrl+S trong Notepad, Ctrl+X rồi Y trong Nano).

---

## 5. Cấu Hình Bot

### Bước 5.1: Tạo Telegram Bot

1. Mở Telegram, tìm [@BotFather](https://t.me/BotFather)
2. Gửi lệnh: `/newbot`
3. Nhập tên bot: `My Moltbot`
4. Nhập username: `my_moltbot` (phải kết thúc bằng `bot`)
5. BotFather sẽ trả về token: `7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw`

**Copy token** và paste vào `.env`:
```env
TELEGRAM_BOT_TOKEN=7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
```

### Bước 5.2: Lấy Moonshot API Key (Tùy chọn)

**Chỉ cần nếu muốn dùng Kimi models.**

1. Truy cập [platform.moonshot.cn](https://platform.moonshot.cn/)
2. Đăng ký/Đăng nhập (cần số điện thoại Trung Quốc hoặc email quốc tế)
3. Vào "API Keys" → Create new key
4. Copy key và paste vào `.env`:

```env
MOONSHOT_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
```

**Nếu không dùng Kimi**: Để trống, chỉ dùng Gemini/Claude.

### Bước 5.3: Xác thực Google Account (OpenClaw)

```bash
openclaw auth login
```

**Flow:**
1. Lệnh sẽ mở trình duyệt
2. Đăng nhập Google Account **có quyền truy cập Gemini API**
3. Chấp nhận permissions
4. Trình duyệt hiện "Authentication successful!"
5. Đóng trình duyệt, quay lại terminal

**Verify:**
```bash
openclaw auth status
```

Expected output:
```
✓ Authenticated as: your.email@gmail.com
✓ Proxy: active
```

---

## 6. Chạy Lần Đầu

### Bước 6.1: Khởi động Config Server

```bash
npm run config
```

**Expected output:**
```
> moltbot@2.0.0 config
> node config-server.js

Server running at http://localhost:8080
```

**Giữ terminal này mở!**

### Bước 6.2: Mở Web UI

1. Mở trình duyệt (Chrome/Edge/Firefox)
2. Truy cập: `http://localhost:8080`
3. Bạn sẽ thấy Moltbot Dashboard

### Bước 6.3: Cấu hình qua Web UI

**Tab "Model AI":**
1. Click vào dropdown "Model chính"
2. Chọn model: **Gemini 3 Flash** (khuyến nghị cho test)
3. *(Không cần nhấn "Lưu Cấu Hình", sẽ tự save khi chạy bot)*

**Tab "Telegram":**
1. Verify "Bot Token" đã tự động load từ `.env`
2. Nếu chưa có, paste token vào và nhấn Save

### Bước 6.4: Khởi động Bot

1. Quay lại tab "Bảng Điều Khiển"
2. Nhấn nút **"🚀 Chạy Bot"** (góc trên phải)
3. Xem Console Log (phía dưới dashboard):

**Expected logs:**
```
23:10:15 💾 Đang lưu cấu hình...
23:10:15 💾 Đã lưu và đồng bộ cấu hình!
23:10:16 🚀 Đang khởi động OpenClaw Gateway...
23:10:17 ✅ Moltbot (OpenClaw) đã khởi động!
23:10:18 🧠 Đang sử dụng Model: google-antigravity/gemini-3-flash
23:10:20 [gateway] agent model: google-antigravity/gemini-3-flash
23:10:20 [gateway] listening on ws://127.0.0.1:18789
23:10:22 [telegram] starting provider (@your_bot)
```

**Nếu thấy dòng cuối `[telegram] starting provider`** → **THÀNH CÔNG!**

---

## 7. Verify Hoạt Động

### Bước 7.1: Test Bot trên Telegram

1. Mở Telegram
2. Tìm bot của bạn (username bạn đã tạo)
3. Gửi tin nhắn: `/start`
4. Bot reply: "Xin chào! Tôi là Moltbot..."
5. Gửi tin nhắn: `Mày xài model gì?`
6. Bot reply: "Gemini 3 Flash" (hoặc model bạn đã chọn)

### Bước 7.2: Test Model Switch

1. Quay lại Web UI
2. Nhấn **"⏹️ Dừng Bot"**
3. Tab "Model AI" → Chọn **Claude Sonnet 4.5**
4. Nhấn **"🚀 Chạy Bot"** lại
5. Check console log:
   ```
   [gateway] agent model: google-antigravity/claude-sonnet-4.5
   ```
6. Test lại trên Telegram: `Mày xài model gì?`
7. Bot reply: "Claude Sonnet 4.5"

### Bước 7.3: Kiểm tra Stats

Trong Web UI, tab "Bảng Điều Khiển":
- **Model đang dùng**: Hiện model hiện tại
- **Kích bàn**: Số kịch bản (nếu có)
- **Tác vụ hoàn thành**: Bot stats

---

## 🎉 Hoàn Thành!

Bạn đã cài đặt thành công Moltbot!

**Next Steps:**
- Đọc [README.md](README.md) để tìm hiểu thêm tính năng
- Check [Troubleshooting](#troubleshooting) nếu gặp lỗi
- Explore các tabs khác trong Web UI

---

## Troubleshooting

### Lỗi: "TELEGRAM_BOT_TOKEN is not set"

**Nguyên nhân**: File `.env` chưa được load.

**Giải pháp:**
1. Kiểm tra file `.env` có ở **thư mục gốc** project không
2. Verify format đúng (không có dấu ngoặc kép):
   ```env
   TELEGRAM_BOT_TOKEN=7123456:AAHdqTcvCH...
   ```
3. Restart config server:
   ```bash
   # Ctrl+C để dừng server cũ
   npm run config
   ```

### Lỗi: "Port 18789 already in use"

**Nguyên nhân**: OpenClaw Gateway đang chạy ẩn.

**Giải pháp (Windows):**
```powershell
taskkill /F /IM node.exe
openclaw gateway stop
npm run config
```

**Giải pháp (Linux/macOS):**
```bash
pkill -9 node
openclaw gateway stop
npm run config
```

### Bot không reply trên Telegram

**Check list:**
1. Token đúng chưa? Test bằng cách gửi request:
   ```bash
   curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe
   ```
2. Console log có hiện `[telegram] starting provider` không?
3. Có lỗi đỏ trong console không?
4. Internet có ổn định không?

### OpenClaw auth failed

**Giải pháp:**
```bash
openclaw auth logout
openclaw auth login
```

Nếu vẫn lỗi, check:
- Google Account có bật 2FA không? (Phải bật)
- Có quyền truy cập Gemini API không?

### Model không đổi sau khi chọn

**Workaround hiện tại:**
1. Chọn model
2. Nhấn **"💾 Lưu Cấu Hình"**
3. Nhấn **"⏹️ Dừng Bot"**
4. Nhấn **"🚀 Chạy Bot"**
5. Verify log: `agent model: google-antigravity/...`

---

## 📞 Cần Trợ Giúp?

- GitHub Issues: [moltbot/issues](https://github.com/YOUR_USERNAME/moltbot/issues)
- Telegram Support Group: [@moltbot_support](https://t.me/moltbot_support)

---

**Happy Botting! 🤖✨**
