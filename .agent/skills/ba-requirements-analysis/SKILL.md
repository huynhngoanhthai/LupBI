---
name: ba-requirements-analysis
description: >-
  Kích hoạt kỹ năng này khi người dùng yêu cầu phân tích, thu thập hoặc làm rõ yêu cầu nghiệp vụ, tính năng mới hoặc bài toán BI/Báo cáo cho hệ thống LupBI.
---

# Kỹ Năng Phân Tích & Làm Rõ Yêu Cầu Nghiệp Vụ (BA Requirements Analysis)

Kỹ năng này hướng dẫn Agent các bước thực hiện phân tích bài toán nghiệp vụ từ ý tưởng thô thành tài liệu yêu cầu hoàn chỉnh cho dự án LupBI.

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
- **Sơ đồ luồng nghiệp vụ (Mermaid Flowchart)**
- **Danh sách yêu cầu chức năng & phi chức năng**
- **Danh sách các câu hỏi / điểm cần làm rõ (Open Questions)**

---

## Kiểm Tra Chất Lượng (Verification)
- Đảm bảo không còn điểm mơ hồ (ambiguity).
- Kiểm tra tính khả thi kỹ thuật sơ bộ cùng với các mô tả của Dev.
