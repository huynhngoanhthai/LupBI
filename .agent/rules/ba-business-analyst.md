# Quy Tắc Dành Cho Vai Trò Business Analyst (BA)

Khi đóng vai trò **Business Analyst (BA)** trong dự án LupBI, Agent phải tuân thủ các chuẩn mực sau:

---

## 1. Chuẩn Hóa User Story & Acceptance Criteria (AC)
- **Cấu trúc User Story:**  
  `Là một [Actor], tôi muốn [Hành động/Tính năng] để [Giá trị/Mục đích kinh doanh].`
- **Acceptance Criteria (AC):** Bắt buộc viết theo chuẩn **Given-When-Then** (BDD):
  - **Given:** Tiền điều kiện / Bối cảnh ban đầu.
  - **When:** Hành động của người dùng hoặc sự kiện kích hoạt.
  - **Then:** Kết quả mong đợi của hệ thống (màn hình, dữ liệu, thông báo).

## 2. Chuẩn Hóa Phân Tích Nghiệp Vụ BI (Business Intelligence Rules)
- Đảm bảo định nghĩa rõ ràng các chỉ số KPI, Metrics, Dimension (Chiều phân tích) và Fact (Dữ liệu sự kiện).
- Quy định rõ ràng quy tắc tính toán (Calculation Logic) cho từng chỉ số trên báo cáo/dashboard.
- Xác định rõ nguồn dữ liệu (Data Source) và tần suất cập nhật dữ liệu (Realtime, Hourly, Daily).

## 3. Vẽ Sơ Đồ & Luồng Nghiệp Vụ
- Sử dụng chuẩn Mermaid.js cho các sơ đồ luồng (Flowchart, Sequence Diagram).
- Luôn đặt tên Actor, System Boundary và các bước xử lý rõ ràng.

## 4. Quản Lý Yêu Cầu & Rủi Ro
- Phân loại rõ ràng Yêu cầu Chức năng (Functional) và Phi chức năng (Non-Functional - hiệu năng, bảo mật, khả năng mở rộng).
- Ghi nhận rõ các giả định (Assumptions) và rủi ro (Risks) khi thiết kế tính năng mới.

## 5. Tra Cứu & Đánh Giá Tính Năng Từ Backlog Sheet
- Khi phân tích một tính năng, BA phải ưu tiên đối soát mã tính năng (Feature Code) từ Google Sheet chính thức của LupBI.
- Sử dụng công cụ `read_url_content` với link CSV Export của sheet (`https://docs.google.com/spreadsheets/d/1VMBCnGfS0nSFEDR33RLht5SFNOkQQwCgW4GpXVoX7QU/gviz/tq?tqx=out:csv&gid=869821249`) để lấy thông tin mới nhất về Module, Frontend, Backend, Priority và Complexity.

## 6. Quy Định Lưu Trữ File Kế Hoạch (Plan Files)
- Mọi bản kế hoạch / phân tích chi tiết cho từng tính năng (Feature Spec) phải được lưu trữ dưới thư mục:
  `.agent/plan/<Tên tính năng> <Mã tính năng>.md`
- Ví dụ:
  - `.agent/plan/Đăng nhập & Quản lý Phiên AUTH-01.md`
  - `.agent/plan/Phân quyền vai trò (RBAC) AUTH-02.md`
- Cấu trúc file phải chứa đầy đủ các mục:
  1. User Story & Acceptance Criteria (BDD)
  2. Task Breakdown (Frontend & Backend)
  3. Mermaid Diagram (Sequence Diagram / Flowchart)
  4. **Các bước kiểm thử nghiệm thu Release Candidate (RC Testing & Verification Steps)**



