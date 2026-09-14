# Quy Tắc Chung Dự Án LupBI (00-General Rules)

Mọi Agent hoạt động trong repository **LupBI** phải tuân thủ nghiêm ngặt các quy tắc chung sau đây:

---

## 1. Nguyên Tắc Tra Cứu & Xác Minh Thực Tế (No Guessing)
- Không tự suy đoán cấu trúc thư mục, tên biến, schema dữ liệu hoặc luồng nghiệp vụ khi chưa tra cứu thực tế trong codebase.
- Luôn kiểm tra kỹ mã nguồn, tài liệu hoặc hỏi rõ người dùng nếu có điểm chưa rõ ràng.

## 2. Ngôn Ngữ & Giao Tiếp
- Sử dụng tiếng Việt rõ ràng, chuyên nghiệp và lịch sự trong mọi phản hồi và tài liệu giao tiếp với người dùng.
- Định dạng văn bản sử dụng Markdown chuẩn (có tiêu đề, danh sách, alert box khi cần).

## 3. Quản Lý Thay Đổi & Kiểm Thử
- Mọi thay đổi về code hoặc tài liệu phải đảm bảo không làm gãy các tính năng/quy trình hiện tại.
- Khi chỉnh sửa file, phải kiểm tra cú pháp và đảm bảo tính nhất quán của toàn bộ dự án.

## 4. Bảo Mật & An Toàn Dữ Liệu
- Không lưu trữ hoặc tiết lộ mật khẩu, API token, secret keys hoặc dữ liệu nhạy cảm trong codebase và tài liệu.

## 5. Nguồn Dữ Liệu Dự Án (Single Source of Truth)
- **Backlog & Danh sách Tính năng:**
  - URL: `https://docs.google.com/spreadsheets/d/1VMBCnGfS0nSFEDR33RLht5SFNOkQQwCgW4GpXVoX7QU/edit?gid=869821249#gid=869821249`
  - CSV Export: `https://docs.google.com/spreadsheets/d/1VMBCnGfS0nSFEDR33RLht5SFNOkQQwCgW4GpXVoX7QU/gviz/tq?tqx=out:csv&gid=869821249`
- **Bộ Công Nghệ Chuẩn (Tech Stack):**
  - URL: `https://docs.google.com/spreadsheets/d/1VMBCnGfS0nSFEDR33RLht5SFNOkQQwCgW4GpXVoX7QU/edit?gid=63425449#gid=63425449`
  - CSV Export: `https://docs.google.com/spreadsheets/d/1VMBCnGfS0nSFEDR33RLht5SFNOkQQwCgW4GpXVoX7QU/gviz/tq?tqx=out:csv&gid=63425449`

## 6. Ưu Tiên Thư Viện UI Chuẩn (No Custom Pure Code)
- **Tuyệt đối ưu tiên sử dụng thư viện UI chuẩn:** Sử dụng các thành phần UI có sẵn từ thư viện **Ant Design (`antd`)** và **Shadcn/UI** cho toàn bộ Frontend (`apps/web`).
- **Nghiêm cấm viết component thuần tùy biến (Custom components) từ đầu:** Đối với Toast notification, Alert, Modal, Table, Form, Select, DatePicker,... bắt buộc tận dụng các component/API chuẩn từ thư viện (ví dụ: `message` / `notification` từ `antd`) thay vì tự tạo custom Zustand store hoặc HTML/CSS tùy biến.


