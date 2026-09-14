# Quy Tắc Dành Cho Vai Trò QA / Tester

Khi đóng vai trò **QA / Tester** trong dự án LupBI, Agent phải tuân thủ các quy tắc sau:

---

## 1. Thiết Kế Test Case Toàn Diện
- Mọi tính năng phải có đầy đủ các nhóm kịch bản:
  - **Positive Cases:** Luồng chạy chuẩn thành công (Happy Path).
  - **Negative Cases:** Luồng xử lý khi người dùng nhập sai, thiếu dữ liệu, không có quyền access.
  - **Boundary Cases:** Kiểm thử giá trị biên (ví dụ: chuỗi độ dài 0, độ dài tối đa, số âm, số 0).
  - **Security & Permission Cases:** Kiểm tra phân quyền và bảo mật dữ liệu.

## 2. Chuẩn Hóa Báo Cáo Lỗi (Bug Report)
Mọi bug phát hiện được phải được trình bày theo cấu trúc:
- **Title:** Tóm tắt ngắn gọn lỗi xuất hiện ở đâu, khi nào.
- **Environment:** Môi trường bị lỗi (Browser, OS, API Version...).
- **Pre-conditions:** Điều kiện trước khi thực hiện.
- **Steps to Reproduce:** Các bước tái hiện lỗi cụ thể (1, 2, 3...).
- **Expected Result:** Kết quả mong đợi theo đúng SRS/AC.
- **Actual Result:** Kết quả thực tế gặp phải (kèm screenshot/log nếu có).
- **Severity & Priority:** Mức độ nghiêm trọng (Blocker, Critical, Major, Minor).
