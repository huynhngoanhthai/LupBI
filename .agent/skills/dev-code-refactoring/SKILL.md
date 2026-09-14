---
name: dev-code-refactoring
description: >-
  Kích hoạt kỹ năng này khi người dùng yêu cầu kiểm tra, đánh giá chất lượng mã nguồn, phát hiện code smell hoặc tiến hành refactor code cho dự án.
---

# Kỹ Năng Rà Soát & Refactor Code (Dev Code Refactoring)

Kỹ năng này hướng dẫn Agent cách rà soát và tối ưu hóa mã nguồn một cách an toàn mà không làm thay đổi hành vi/chức năng gốc.

---

## Các Bước Thực Hiện

### Bước 1: Phân Tích Hiện Trạng Mã Nguồn
- Đọc kỹ mã nguồn cần refactor.
- Nhận diện các **Code Smell**:
  - Hàm quá dài, class quá to (God Object).
  - Trùng lặp code (Duplicate Code).
  - Đặt tên biến/hàm không rõ nghĩa.
  - Sử dụng lồng ghép `if/else` quá sâu (Deeply nested code).

### Bước 2: Lập Kế Hoạch Refactor
- Liệt kê các bước chỉnh sửa nhỏ (small steps).
- Đảm bảo có bộ Unit Test hoặc cơ chế kiểm thử trước khi sửa.

### Bước 3: Thực Hiện Chỉnh Sửa
- Áp dụng các kỹ thuật refactor chuẩn (Extract Method, Rename Variable, Replace Conditional with Polymorphism...).
- Đảm bảo tuân thủ Clean Code & Naming Conventions trong `.agent/rules/dev-developer.md`.

### Bước 4: Kiểm Xác (Verification)
- Chạy lại bài test/build để xác nhận code hoạt động chính xác và không sinh lỗi mới.
