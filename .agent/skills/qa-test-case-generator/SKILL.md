---
name: qa-test-case-generator
description: >-
  Kích hoạt kỹ năng này khi người dùng muốn thiết kế kịch bản kiểm thử, tạo danh sách Test Case hoặc Matrix Test cho một tính năng trong dự án LupBI.
---

# Kỹ Năng Thiết Kế Test Case (QA Test Case Generator)

Kỹ năng này hướng dẫn Agent tạo ra bảng Test Case đầy đủ và đạt chuẩn kiểm thử phần mềm.

---

## Mẫu Bảng Test Case Chuẩn

| Test Case ID | Feature / Module | Title / Objective | Pre-conditions | Test Steps | Test Data | Expected Result | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TC-01` | Dashboard | Kiểm tra tải dữ liệu tổng doanh thu thành công | Người dùng đã đăng nhập vai trò Admin | 1. Truy cập Dashboard<br>2. Chọn kỳ báo cáo "Tháng này" | N/A | Biểu đồ doanh thu hiển thị đúng số liệu theo DB | High |
| `TC-02` | Dashboard | Kiểm tra báo lỗi khi chọn khoảng thời gian không hợp lệ | Người dùng ở màn hình Dashboard | 1. Chọn Từ ngày: 30/12/2026<br>2. Chọn Đến ngày: 01/01/2026 | Date range invalid | Hiển thị thông báo "Ngày bắt đầu phải nhỏ hơn ngày kết thúc" | Medium |

---

## Các Bước Thiết Kế
1. **Đọc yêu cầu (User Story/AC):** Nắm rõ logic và điều kiện biên.
2. **Liệt kê Scenarios:** Tách thành Functional, Non-functional, Boundary, UI/UX, Security.
3. **Viết chi tiết từng Test Case:** Đảm bảo từng bước rõ ràng, dữ liệu thử nghiệm cụ thể.
