# 🤖 Moltbot - OpenClaw Bot với Moonshot Kimi

Bot AI cá nhân chạy trên OpenClaw, hỗ trợ Moonshot Kimi và Google Gemma.

## ✨ Tính năng

- 🌙 **Moonshot Kimi K2.5** - Model AI mới nhất với 256K context
- 🔷 **Google Gemma 3** - Qua proxy xoay vòng API key
- 📱 **Telegram** - Điều khiển bot qua Telegram
- ⚡ **Skills** - Mở rộng với các skill tùy chỉnh
- 🎨 **Config UI** - Giao diện cấu hình tiếng Việt

## 🚀 Cài đặt

### 1. Clone repo

```bash
git clone https://github.com/YOUR_USERNAME/moltbot.git
cd moltbot
```

### 2. Cấu hình môi trường

```bash
# Sao chép file mẫu
cp .env.example .env

# Mở và điền các API key
notepad .env
```

### 3. Cài đặt dependencies

```bash
npm install
cd skills/book-price-scraper && npm install && cd ../..
```

### 4. Chạy proxy (nếu dùng Google Gemma)

```bash
node google-proxy.js
```

### 5. Chạy OpenClaw

```bash
openclaw --config openclaw.json
```

## 🎨 Giao diện cấu hình

Mở file `config-ui/index.html` trong trình duyệt để cấu hình bot một cách trực quan.

## 📁 Cấu trúc thư mục

```
moltbot/
├── .env                    # API keys (không upload)
├── .env.example            # Mẫu file .env
├── .gitignore             # Loại trừ file nhạy cảm
├── openclaw.json          # Cấu hình OpenClaw
├── google-proxy.js        # Proxy xoay vòng Google API
├── package.json           # Dependencies
├── config-ui/             # Giao diện cấu hình
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── skills/                # Thư mục skills
    └── book-price-scraper/
        ├── SKILL.md
        ├── index.js
        └── package.json
```

## 🌙 Các Model Moonshot Kimi

| Model | Context | Đặc điểm |
|-------|---------|----------|
| `kimi-k2.5` | 256K | Mới nhất, multimodal |
| `kimi-k2-turbo-preview` | 256K | Nhanh |
| `kimi-k2-thinking` | 256K | Suy luận sâu |
| `moonshot-v1-128k` | 128K | Ổn định |

## 📝 License

MIT
