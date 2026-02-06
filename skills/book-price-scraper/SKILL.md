---
name: book-price-scraper
description: Tìm kiếm và so sánh giá sách trên Tiki và Fahasa
metadata:
  openclaw.emoji: 📚
  openclaw.bins: [node]
  version: "2.0.0"
  author: Moltbot Team
  language: vi
---

# Book Price Scraper

Skill này giúp bạn tìm kiếm và so sánh giá sách trên các nhà sách trực tuyến Việt Nam.

## Cách sử dụng

Gửi tin nhắn cho bot theo format:

```
Tìm giá sách [tên sách]
```

Ví dụ:
- "Tìm giá sách Đắc Nhân Tâm"
- "Tìm giá sách Harry Potter"
- "So sánh giá Nhà Giả Kim"

## Các lệnh hỗ trợ

| Lệnh | Mô tả |
|------|-------|
| `scrape_book` | Tìm kiếm giá sách trên Tiki và Fahasa |

## Kết quả trả về

Bot sẽ trả về danh sách kết quả bao gồm:
- 📖 Tên sách
- 💰 Giá bán
- 🛒 Nguồn (Tiki/Fahasa)
- 🔗 Link mua hàng

## Lưu ý

- Kết quả được giới hạn 3 sản phẩm mỗi nguồn để tránh spam
- Giá có thể thay đổi theo thời gian thực
- Một số sách có thể không có trên cả hai nguồn
