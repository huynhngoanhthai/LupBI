---
name: ba-requirements-analysis
description: >-
  Kích hoạt kỹ năng này khi người dùng yêu cầu phân tích, thu thập hoặc làm rõ yêu cầu nghiệp vụ, tính năng mới hoặc bài toán BI/Báo cáo cho hệ thống LupBI (bao gồm kịch bản kiểm thử RC và khung đánh giá tiến độ hoàn thành %).
---

# Kỹ Năng Phân Tích & Làm Rõ Yêu Cầu Nghiệp Vụ (BA Requirements Analysis)

Kỹ năng này hướng dẫn Agent các bước thực hiện phân tích bài toán nghiệp vụ từ ý tưởng thô thành tài liệu yêu cầu hoàn chỉnh cho dự án LupBI, bao gồm kịch bản kiểm thử **Release Candidate (RC)** và khung theo dõi **Tiến độ hoàn thành (%)**.

---

## Các Bước Thực Hiện

### Bước 1: Khai Phá & Thu Thập Yêu Cầu (Discovery)

1. Xác định **Mục tiêu kinh doanh (Business Goal)**: Tính năng này giải quyết vấn đề gì?
2. Xác định **Đối tượng sử dụng (Actors/Stakeholders)**: Ai là người dùng trực tiếp hoặc thụ hưởng?
3. Xác định **Phạm vi (Scope)**: Những gì thuộc phạm vi (In-Scope) và không thuộc phạm vi (Out-of-Scope).

### Bước 2: Phân Tích Bài Toán Dữ Liệu & BI (Nếu liên quan đến Báo cáo/Dashboard)

1. Liệt kê các chỉ số cần hiển thị (**KPIs / Metrics**).
2. Xác định công thức tính toán (**Calculation Logic**).
3. Đề xuất dạng biểu đồ phù hợp (Bar chart, Line chart, Pie chart, Pivot table...).
4. Xác định luồng dữ liệu đầu vào & tần suất cập nhật (Realtime, Daily...).

### Bước 3: Chuẩn Hóa Kết Quả Thành Tài Liệu

Xuất ra kết quả phân tích theo mẫu chuẩn:

- **Tóm tắt tổng quan**
- **Sơ đồ luồng nghiệp vụ (Mermaid Flowchart / Sequence Diagram)**
- **Danh sách yêu cầu chức năng & phi chức năng**
- **User Story & Acceptance Criteria (BDD)**
- **Task breakdown cho Frontend & Backend**

### Bước 4: Thiết Kế Các Bước Kiểm Thử Release Candidate (RC Testing & Verification Steps)

Đưa ra kịch bản kiểm thử nghiệm thu cho phiên bản RC trước khi release production:

1. **RC Pre-conditions Check:** Kiểm tra môi trường staging/RC, dữ liệu test và cấu hình biến môi trường.
2. **RC Test Execution Matrix:** Bảng danh sách các kịch bản kiểm thử nghiệm thu (Test Steps, Expected Behavior, Sign-off Status).
3. **RC Rollback Criteria:** Tiêu chí và các bước hủy bản RC nếu phát hiện lỗi nghiêm trọng (Blocker/Critical).

### Bước 5: Thêm Khung Tiến Độ & Ghi Chú Nghiệm Thu Ở Cuối File (Progress & Notes)

Ở dòng cuối cùng của tài liệu kế hoạch, bắt buộc thêm khung theo dõi tiến độ hoàn thành (mặc định ban đầu 0%) và phần ghi chú dành cho QA:

```markdown
---

## 📊 Tiến Độ Hoàn Thành & Ghi Chú Nghiệm Thu (QA Sign-off & Feedback)

- **Tiến độ hoàn thành:** `0%` (Chờ triển khai & kiểm thử)
- **UI** `[===>----] 35%`
- **BE** `[=====>---] 50%`
- **DB** `[====>----] 43%`
- **Trạng thái:** `Ready for Dev`

### 📝 Ghi Chú & Nhận Xét Từ QA (Tester Notes)

_(Mục này sẽ do QA cập nhật khi tiến hành kiểm thử nghiệm thu bản RC)_
```

### Bước 6: Lưu Tệp Kế Hoạch Chi Tiết (Plan Storage)

- Tạo và lưu tệp tài liệu tại đường dẫn: `.agent/plan/<Tên tính năng> <Mã tính năng>.md`
- Ví dụ: `.agent/plan/Đăng nhập & Quản lý Phiên AUTH-01.md`
