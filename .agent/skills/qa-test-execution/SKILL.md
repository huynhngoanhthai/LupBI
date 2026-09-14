---
name: qa-test-execution
description: >-
  Kích hoạt kỹ năng này khi QA tiến hành kiểm thử nghiệm thu bản RC cho một tính năng, cập nhật tỷ lệ hoàn thành (%), cập nhật bảng kết quả kịch bản test và ghi nhận các nhận xét phản hồi (nghiệp vụ sai, UI xấu/vỡ layout, tối ưu tốc độ, khó thao tác, sai cấu trúc...) vào file kế hoạch tại .agent/plan/.
---

# Kỹ Năng Kiểm Thử Nghiệm Thu & Cập Nhật Tiến Độ (QA Test Execution & Sign-off)

Kỹ năng này hướng dẫn Agent đóng vai trò QA tiến hành thực thi kiểm thử nghiệm thu bản **Release Candidate (RC)** cho tính năng trong hệ thống LupBI, cập nhật tỷ lệ phần trăm hoàn thành (%) và ghi nhận phản hồi vào file phân tích tại `.agent/plan/`.

---

## Quy Trình Thực Hiện Của QA

### Bước 1: Tìm & Đọc Tệp Phân Tích Kế Hoạch

1. Mở file phân tích tính năng tương ứng trong thư mục `.agent/plan/<Tên tính năng> <Mã tính năng>.md`.
2. Rà soát bảng **Kịch Bản Kiểm Thử RC (RC Test Verification Checklist)** do BA thiết lập.

### Bước 2: Thực Thi Kiểm Thử & Đánh Giá Tỷ Lệ Hoàn Thành (%)

1. Kiểm tra từng kịch bản (ví dụ: `RC-01`, `RC-02`...) trên môi trường RC/Staging.
2. Đánh giá trạng thái thực tế:
   - `🟩 PASS`: Kịch bản chạy đúng thiết kế.
   - `🟥 FAIL`: Kịch bản bị lỗi hoặc không hoạt động.
   - `🟧 BLOCKED`: Bị nghẽn do lỗi phụ thuộc khác.
3. Tính toán **Tỷ lệ hoàn thành (%)**:
   $$\text{Tiến độ hoàn thành (\%)} = \left( \frac{\text{Số kịch bản PASS}}{\text{Tổng số kịch bản RC}} \right) \times 100\%$$

### Bước 3: Cập Nhật Tiến Độ & Ghi Chú Phản Hồi Về Tệp Kế Hoạch

Cập nhật trực tiếp đoạn thông tin ở cuối file `.agent/plan/<Tên tính năng> <Mã tính năng>.md`:

1. **Điền phần trăm hoàn thành (%) và trạng thái mới:**
   - Ví dụ: `- **Tiến độ hoàn thành:** 80% (PASS 4/5 Scenarios)`
   - Trạng thái: `RC Tested - Needs Fixes` hoặc `RC Approved - Ready for Prod`.

2. **Ghi nhận phản hồi chi tiết từ QA (Tester Notes) phân loại theo các nhóm vấn đề:**
   - 🔴 **Lỗi Nghiệp vụ (Business Logic Issues):** Logic xử lý sai so với AC/BRD.
   - 🎨 **Giao diện & UI/UX (UI/UX Defects):** UI xấu, vỡ layout, sai font/màu sắc, Responsive kém.
   - ⚡ **Hiệu năng & Tốc độ (Performance Issues):** API phản hồi chậm, query đơ/treo, load trang lâu.
   - 🖐️ **Trải nghiệm & Thao tác (Usability Issues):** Người dùng khó thao tác, thiếu thông báo/feedback rõ ràng.
   - 📐 **Sai Cấu trúc & Architecture (Structural Mismatch):** Sai quy chuẩn mã nguồn, sai API payload hoặc DB schema đã đề ra.
   - 🐛 **Bổ sung Edge Cases / Bugs:** Các phát hiện lỗi biên khác.

---

## Mẫu Cập Nhật Cuối File `.agent/plan/` Sau Khi QA Test

```markdown
---

## 📊 Tiến Độ Hoàn Thành & Ghi Chú Nghiệm Thu (QA Sign-off & Feedback)

- **Tiến độ hoàn thành:** `80%` (PASS 4/5 kịch bản RC) và vẽ UI [===>----] 80%
- **Trạng thái:** `RC Tested - Cần điều chỉnh lỗi UI & Speed`
- **Ngày kiểm thử:** YYYY-MM-DD
- **Người kiểm thử (QA):** AI Agent / Tester

### 📝 Ghi Chú & Nhận Xét Từ QA (Tester Notes)

#### 🔴 Lỗi Nghiệp Vụ (Business Logic):

- None (Logic chạy đúng phân quyền).

#### 🎨 Giao Diện (UI/UX):

- Form Login trên màn hình mobile (375px) bị tràn viền button Submit (UI vỡ layout).

#### ⚡ Tốc Độ & Hiệu Năng (Performance):

- API `POST /api/v1/auth/login` phản hồi mất 1.2s (cần tối ưu bcrypt saltRounds hoặc connection pool DB).

#### 🖐️ Trải Nghiệm Người Dùng (Usability):

- Nút "Đăng nhập" khi bấm chưa có trạng thái Disable / Loading spinner làm người dùng bấm nhiều lần (Double click issue).

#### 📐 Cấu Trúc & Quy Chuẩn (Architecture):

- Payload trả về của API `/auth/login` đặt tên key `user_id` thay vì `userId` (sai camelCase convention).
```
