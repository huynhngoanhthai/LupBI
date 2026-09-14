---
name: ba-user-story-generator
description: >-
  Kích hoạt kỹ năng này khi người dùng muốn viết, chuyển đổi hoặc chuẩn hóa các yêu cầu tính năng thành dạng User Story và Acceptance Criteria chuẩn BDD.
---

# Kỹ Năng Tạo User Story & Acceptance Criteria (BA User Story Generator)

Kỹ năng này giúp Agent chuyển đổi một ý tưởng/tính năng thành bộ User Story chuẩn cho đội ngũ Agile/Scrum.

---

## Mẫu Cấu Trúc Xuất Báo Cáo

### 1. Thông Tin User Story
- **Story ID:** `US-[Mô-đun]-[Số]`
- **Title:** Tên tính năng ngắn gọn.
- **User Story Statement:**  
  > Là một **[Actor/Vai trò]**,  
  > Tôi muốn **[Hành động/Tính năng]**,  
  > Để **[Giá trị mang lại/Lợi ích kinh doanh]**.

### 2. Tiêu Chí Chấp Nhận (Acceptance Criteria - AC)
Viết các kịch bản kiểm thử Acceptance Criteria theo cú pháp BDD:

#### Scenario 1: [Tên kịch bản thành công - Happy Path]
- **Given** [Điều kiện ban đầu/Trạng thái hệ thống]
- **When** [Người dùng thực hiện hành động]
- **Then** [Hệ thống phản hồi/Kết quả trả về]

#### Scenario 2: [Tên kịch bản ngoại lệ/lỗi - Exception Path]
- **Given** [Điều kiện ban đầu]
- **When** [Người dùng thực hiện hành động sai/thiếu]
- **Then** [Hệ thống báo lỗi tương ứng]

---

## Hướng Dẫn Thực Hiện
1. Nhận thông tin yêu cầu tính năng từ người dùng.
2. Xác định Actor chính và giá trị cốt lõi.
3. Tạo User Story statement và phân tách thành các Scenario AC ít nhất gồm 1 Happy path và 1 Exception path.
