---
name: excel-writer
description: Ghi dữ liệu JSON vào file Excel (.xlsx). Dùng để xuất báo cáo, lưu danh sách giá, v.v.
input:
  type: object
  properties:
    data:
      type: array
      description: Danh sách dữ liệu cần lưu (Mảng các Object). Ví dụ `[{"Tên": "Sách A", "Giá": 100}]`.
    filename:
      type: string
      description: Tên file kết quả (không cần đuôi .xlsx, tự động thêm). Ví dụ `gia_sach`.
    sheetName:
      type: string
      description: Tên của Sheet trong Excel (Tùy chọn).
  required: [data, filename]
metadata:
  openclaw.emoji: 📊
  openclaw.bins: [node]
---

# Hướng dẫn
Skill này dùng để tạo file Excel. Khi người dùng yêu cầu "Lưu vào excel" hoặc "Xuất file excel", hãy dùng skill này.

## Ví dụ sử dụng
```javascript
// Input
{
  "filename": "danh_sach_sach",
  "data": [
    { "Ten": "Dac Nhan Tam", "Gia": "50.000d", "NoiBan": "Tiki" },
    { "Ten": "Nha Gia Kim", "Gia": "60.000d", "NoiBan": "Fahasa" }
  ]
}
```
