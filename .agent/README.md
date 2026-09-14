# Antigravity Customizations & Governance (`.agent`)

Thư mục `.agent` là trung tâm điều hướng, quản trị quy trình và định hình kỹ năng cho các **AI Agents** làm việc trên dự án **LupBI**.

---

## 📁 Cấu Trúc Thư Mục

```text
.agent/
├── AGENTS.md                            # Quy tắc tổng quan & Naming conventions chính thức
├── README.md                            # Tài liệu tổng quan về thư mục .agent
├── rules/                               # Định nghĩa các Nguyên tắc & Tiêu chuẩn (Rules)
│   ├── 00-general-rules.md              # Quy tắc chung cho toàn bộ Agent trong dự án
│   ├── ba-business-analyst.md           # Quy tắc cho Business Analyst
│   └── qa-tester.md                     # Quy tắc cho QA / Tester
├── plan/                                # Thư mục lưu trữ kế hoạch & thiết kế tính năng
│   ├── Đăng nhập & Quản lý Phiên AUTH-01.md
│   ├── Phân quyền vai trò (RBAC) AUTH-02.md
│   ├── Quản lý kết nối Database CONN-01.md
│   └── Đồng bộ Schema & Metadata CONN-02.md
└── skills/                              # Thư mục định nghĩa Kỹ năng Quy trình (Skills)
    ├── ba-requirements-analysis/        # Skill BA: Khai phá yêu cầu, kịch bản RC & khung % tiến độ
    │   └── SKILL.md
    ├── ba-user-story-generator/         # Skill BA: Viết User Story & Acceptance Criteria (BDD)
    │   └── SKILL.md
    ├── ba-sync-backlog/                 # Skill BA: Đồng bộ & tra cứu backlog dự án
    │   └── SKILL.md
    ├── dev-implement-feature/           # Skill Dev: Triển khai tính năng FE/BE, anti N+1, hỏi push git
    │   └── SKILL.md
    └── qa-test-execution/               # Skill QA: Kiểm thử nghiệm thu RC, cập nhật tiến độ [===>---] %
        └── SKILL.md
```

---

## 🚀 Các Kỹ Năng Quy Trình (Available Skills)

1. **`ba-requirements-analysis`**: Phân tích bài toán nghiệp vụ thô, thiết kế kịch bản RC và khởi tạo khung tiến độ `[----------] 0%`.
2. **`ba-user-story-generator`**: Chuyển đổi yêu cầu tính năng thành chuẩn BDD (Given-When-Then).
3. **`ba-sync-backlog`**: Tra cứu và cập nhật danh sách công việc từ backlog.
4. **`dev-implement-feature`**: Triển khai tính năng từ kế hoạch, phân tách FE/BE, triệt tiêu lỗi N+1 Query, hỗ trợ hiển thị dữ liệu lớn (Virtual Scrolling) và xác nhận push code lên Git branch.
5. **`qa-test-execution`**: Thực thi kịch bản nghiệm thu RC, đánh giá tỷ lệ phần trăm PASS và vẽ thanh tiến độ `[===>----] X%` trong file kế hoạch.

---

## 📌 Quy Định Đặt Tên & Đóng Góp

- **Rules (`.agent/rules/`):** Tên file dạng `<role>-<topic>.md` (dùng chữ thường và dấu gạch nối).
- **Skills (`.agent/skills/`):** Tên thư mục dạng `<role>-<skill-name>/`, chứa tệp chính bắt buộc tên là `SKILL.md`.
- **Plans (`.agent/plan/`):** Tên file dạng `<Tên tính năng> <Mã tính năng>.md`.
