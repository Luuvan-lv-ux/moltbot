# 🚀 Quick Start Guide - Git & GitHub Setup

## Bước 1: Khởi tạo Git Repository (Local)

```bash
cd d:\moltbot  # Hoặc thư mục project của bạn
git init
git add .
git commit -m "Initial commit: Moltbot v2.1 with Web UI"
```

---

## Bước 2: Tạo Repository trên GitHub

### Option A: Qua Web Interface

1. Truy cập [github.com](https://github.com)
2. Click **"New repository"** (nút xanh góc trên phải)
3. Điền thông tin:
   - **Repository name**: `moltbot`
   - **Description**: `AI-powered Telegram bot with OpenClaw Gateway`
   - **Visibility**: `Private` (khuyến nghị) hoặc `Public`
   - **KHÔNG tick** "Initialize with README" (vì đã có rồi)
4. Click **"Create repository"**

### Option B: Qua GitHub CLI

```bash
# Cài GitHub CLI nếu chưa có
winget install GitHub.cli  # Windows
brew install gh            # macOS

# Authenticate
gh auth login

# Tạo repo
gh repo create moltbot --private --source=. --remote=origin --push
```

---

## Bước 3: Push lên GitHub

**Nếu dùng Option A (Web)**, GitHub sẽ hiện hướng dẫn:

```bash
git remote add origin https://github.com/YOUR_USERNAME/moltbot.git
git branch -M main
git push -u origin main
```

**Thay `YOUR_USERNAME`** bằng username GitHub của bạn.

**Verify:**
```bash
git remote -v
# Phải hiện:
# origin  https://github.com/YOUR_USERNAME/moltbot.git (fetch)
# origin  https://github.com/YOUR_USERNAME/moltbot.git (push)
```

---

## Bước 4: Verify Files đã Push

Truy cập: `https://github.com/YOUR_USERNAME/moltbot`

**Phải thấy các files:**
- ✅ README.md
- ✅ INSTALL.md
- ✅ .gitignore
- ✅ .env.example
- ✅ config.sample.json
- ✅ package.json
- ✅ config-server.js
- ✅ config-ui/ (folder)

**KHÔNG được thấy:**
- ❌ .env (chứa secrets)
- ❌ config.json (chứa tokens)
- ❌ node_modules/
- ❌ .openclaw/

Nếu thấy file `.env` hoặc `config.json` **→ XÓA NGAY!**

```bash
# Xóa file khỏi Git (nhưng giữ file local)
git rm --cached .env
git rm --cached config.json
git commit -m "Remove sensitive files"
git push
```

---

## Bước 5: Setup trên Máy Mới

Trên máy mới, làm theo [INSTALL.md](INSTALL.md):

```bash
# Clone repo
git clone https://github.com/YOUR_USERNAME/moltbot.git
cd moltbot

# Cài dependencies
npm install

# Copy template env
cp .env.example .env

# Sửa .env với tokens thật
notepad .env  # Windows
nano .env     # Linux/macOS

# Xác thực OpenClaw
openclaw auth login

# Chạy bot
npm run config
```

---

## ⚠️ Security Checklist

trước khi push lên GitHub, **LUÔN** check:

```bash
# Xem file nào sẽ được push
git status

# Xem nội dung sẽ được commit
git diff --cached

# Kiểm tra .gitignore hoạt động chưa
git check-ignore -v .env
git check-ignore -v config.json
git check-ignore -v node_modules/

# Mỗi dòng phải hiện:
# .gitignore:X:.env    .env
# ...
```

**Nếu check-ignore KHÔNG hiện gì** → File KHÔNG được ignore → **NGUY HIỂM!**

---

## 🔄 Workflow Hàng Ngày

### Sau khi sửa code:

```bash
git status                    # Xem file nào thay đổi
git add .                     # Stage tất cả
git commit -m "Fix: Model selection auto-save"
git push                      # Push lên GitHub
```

### Pull code mới từ GitHub:

```bash
git pull origin main
npm install  # Nếu có dependencies mới
```

---

## 📦 Release Version

Khi muốn tạo version release:

```bash
# Tag version
git tag -a v2.1.0 -m "Release v2.1: Web UI with model auto-save"
git push origin v2.1.0

# Trên GitHub → Releases → Draft new release → Chọn tag v2.1.0
```

---

## 🆘 Troubleshooting Git

### "Authentication failed"

**HTTPS:**
```bash
# Dùng Personal Access Token thay vì password
gh auth login  # Hoặc config Git credential helper
```

**SSH (khuyến nghị):**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub  # Linux/macOS
type %USERPROFILE%\.ssh\id_ed25519.pub  # Windows

# Paste vào GitHub → Settings → SSH Keys → New SSH key

# Đổi remote sang SSH
git remote set-url origin git@github.com:YOUR_USERNAME/moltbot.git
```

### "File too large"

GitHub giới hạn file 100MB.

```bash
# Tìm file lớn
git ls-files | xargs ls -lh | sort -k5 -hr | head -10

# Xóa file lớn khỏi history (DANGER!)
git filter-branch --tree-filter 'rm -f path/to/large/file' HEAD
git push --force
```

**Better**: Thêm vào `.gitignore` trước khi commit!

---

**Happy coding! 🎉**
