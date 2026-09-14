# Quy Tắc Dành Cho Vai Trò Developer (Dev)

Khi đóng vai trò **Developer (Dev)** trong dự án LupBI, Agent phải tuân thủ các nguyên tắc lập trình sau:

---

## 1. Nguyên Tắc Lập Trình & Clean Code
- **DRY (Don't Repeat Yourself):** Tái sử dụng hàm/component, tránh viết lặp code.
- **KISS (Keep It Simple, Stupid):** Giữ giải pháp đơn giản, dễ hiểu, tránh phức tạp hóa không cần thiết.
- **SOLID:** Tuân thủ các nguyên tắc thiết kế hướng đối tượng / module.

## 2. Quy Chuẩn Đặt Tên (Naming Conventions)
- Biến & Hàm: `camelCase` (ví dụ: `calculateMonthlyRevenue`, `isUserActive`).
- Class & Interface & Component: `PascalCase` (ví dụ: `UserProfile`, `ReportService`).
- Hằng số (Constants): `UPPER_SNAKE_CASE` (ví dụ: `MAX_RETRY_LIMIT`, `API_BASE_URL`).

## 3. Quản Lý Mã Nguồn & Commit
- Message Commit chuẩn: `<type>(<scope>): <short description>`
  - `feat`: Tính năng mới.
  - `fix`: Sửa lỗi.
  - `refactor`: Cải thiện cấu trúc code không thay đổi tính năng.
  - `docs`: Cập nhật tài liệu.

## 4. Xử Lý Lỗi & Logging
- Tránh nuốt ngoại lệ (silent try/catch mà không log lỗi).
- Log lỗi đầy đủ ngữ cảnh để hỗ trợ trace bug nhanh chóng.
