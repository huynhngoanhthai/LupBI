---
name: ba-sync-backlog
description: >-
  Kích hoạt kỹ năng này khi cần đọc, tra cứu hoặc đồng bộ danh sách tính năng, backlog, priority từ Google Spreadsheet chính thức của dự án LupBI.
---

# Kỹ Năng Đồng Bộ & Tra Cứu Backlog LupBI (BA Sync Backlog)

Kỹ năng này giúp Agent tự động kết nối và trích xuất dữ liệu backlog mới nhất từ Google Spreadsheet của dự án **LupBI**.

---

## Nguồn Dữ Liệu
- **Spreadsheet URL:** `https://docs.google.com/spreadsheets/d/1VMBCnGfS0nSFEDR33RLht5SFNOkQQwCgW4GpXVoX7QU/edit?gid=869821249#gid=869821249`
- **CSV Export URL:** `https://docs.google.com/spreadsheets/d/1VMBCnGfS0nSFEDR33RLht5SFNOkQQwCgW4GpXVoX7QU/gviz/tq?tqx=out:csv&gid=869821249`

---

## Các Bước Thực Hiện

### Bước 1: Đọc Dữ Liệu Mới Nhất
Sử dụng công cụ `read_url_content` để đọc nội dung từ đường dẫn CSV Export:
`https://docs.google.com/spreadsheets/d/1VMBCnGfS0nSFEDR33RLht5SFNOkQQwCgW4GpXVoX7QU/gviz/tq?tqx=out:csv&gid=869821249`

### Bước 2: Phân Tích Cấu Trúc Dữ Liệu
Trích xuất các cột thông tin:
1. `Module`: Tên phân hệ chức năng.
2. `Mã tính năng`: Mã định danh (ví dụ: `AUTH-01`, `SQL-01`, `DASH-01`).
3. `Tên tính năng`: Tên ngắn gọn của tính năng.
4. `Mô tả chi tiết`: Diễn giải yêu cầu kinh doanh/nghiệp vụ.
5. `Frontend (Next.js / React TS)`: Yêu cầu giao diện & client logic.
6. `Backend (Node.js / Express / NestJS TS)`: Yêu cầu xử lý server & API.
7. `Mức độ ưu tiên`: P0 (Core MVP), P1 (Thiết yếu), P2 (Nâng cao).
8. `Độ phức tạp`: Thấp, Trung bình, Cao.

### Bước 3: Đưa Vào Luồng Phân Tích BA
- Khi người dùng yêu cầu làm việc với mã tính năng nào, Agent tiến hành lấy thông tin tương ứng từ dữ liệu vừa đồng bộ.
- Kích hoạt kỹ năng `ba-requirements-analysis` để phân tích và khởi tạo file kế hoạch tại `.agent/plan/`.
