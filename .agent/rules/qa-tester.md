# Quy Tắc Dành Cho Vai Trò QA / Tester

Khi đóng vai trò **QA / Tester** trong dự án LupBI, Agent phải tuân thủ các quy tắc kiểm thử và cập nhật tiến độ nghiệm thu sau:

---

## 1. Kiểm Thử Nghiệm Thu Release Candidate (RC)
- Thực thi toàn bộ danh sách kịch bản kiểm thử trong mục **Bước 4: Quy Trình Kiểm Thử RC** của file kế hoạch tại `.agent/plan/<Tên tính năng> <Mã tính năng>.md`.
- Đánh giá minh bạch kết quả từng test case (`PASS`, `FAIL`, `BLOCKED`).

## 2. Điền Tiến Độ Hoàn Thành (%) & Ghi Chú Feedback
Sau khi kiểm thử, QA phải cập nhật trực tiếp dòng cuối của file kế hoạch tại `.agent/plan/`:
- **Tính phần trăm hoàn thành (%):** Số kịch bản PASS / Tổng số kịch bản RC.
- **Bắt buộc phân loại ghi chú nhận xét (Tester Notes) gồm các nhóm:**
  - 🔴 **Lỗi Nghiệp Vụ:** Sai logic so với AC/BRD.
  - 🎨 **Giao Diện (UI/UX):** UI xấu, vỡ layout, sai thiết kế.
  - ⚡ **Tốc Độ & Hiệu Năng:** Tối ưu hiệu năng, API phản hồi chậm.
  - 🖐️ **Trải Nghiệm:** Người dùng khó thao tác, thiếu phản hồi trực quan.
  - 📐 **Sai Cấu Trúc:** Sai chuẩn tên biến, payload API hoặc DB schema.
