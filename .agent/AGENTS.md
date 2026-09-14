# Antigravity Agent Customizations (`.agent`) - Dự án LupBI

Thư mục `.agent` chứa các quy định (**Rules**) và kỹ năng (**Skills**) giúp định hướng AI Agent làm việc chính xác, nhất quán và hiệu quả theo đúng quy trình của dự án **LupBI**.

---

## 📁 Cấu Trúc Thư Mục Phân Theo Vai Trò

```text
.agent/
├── AGENTS.md                            # Tài liệu quy định & hướng dẫn chính thức cho Agent
├── README.md                            # Tài liệu giới thiệu dự án & tổng quan thư mục
├── rules/                               # Định nghĩa các Nguyên tắc & Tiêu chuẩn (Rules)
│   ├── 00-general-rules.md              # Quy tắc dùng chung cho tất cả các vai trò
│   ├── ba-business-analyst.md           # Quy tắc dành cho Business Analyst
│   └── qa-tester.md                     # Quy tắc dành cho QA / Tester
├── plan/                                # Thư mục lưu trữ kế hoạch & thiết kế tính năng
│   ├── Đăng nhập & Quản lý Phiên AUTH-01.md
│   ├── Phân quyền vai trò (RBAC) AUTH-02.md
│   ├── Quản lý kết nối Database CONN-01.md
│   └── Đồng bộ Schema & Metadata CONN-02.md
└── skills/                              # Định nghĩa các Kỹ năng Quy trình (Skills)
    ├── ba-requirements-analysis/        # Skill: Phân tích nghiệp vụ, tạo kịch bản RC & khung tiến độ %
    │   └── SKILL.md
    ├── ba-user-story-generator/         # Skill: Viết User Story & Acceptance Criteria chuẩn BDD
    │   └── SKILL.md
    ├── ba-sync-backlog/                 # Skill: Đồng bộ & tra cứu backlog từ Google Sheet LupBI
    │   └── SKILL.md
    └── qa-test-execution/               # Skill QA: Kiểm thử RC, điền % hoàn thành & ghi chú lỗi UI/Speed/Logic
        └── SKILL.md
```

---

## 🏷️ Quy Chuẩn Đặt Tên (Naming Conventions)

### 1. Quy tắc đặt tên Rules (`.agent/rules/`)
- Tên file: `<role>-<topic>.md` (sử dụng chữ thường, phân cách bởi dấu gạch nối `-`).
- Ví dụ: `ba-business-analyst.md`, `qa-tester.md`.
- Các quy tắc chung áp dụng toàn dự án dùng tiền tố `00-` (ví dụ: `00-general-rules.md`).

### 2. Quy tắc đặt tên Skills (`.agent/skills/`)
- Thư mục Skill: `<role>-<skill-name>/` (sử dụng chữ thường, phân cách bởi dấu gạch nối `-`).
- File chính trong thư mục skill: Bắt buộc đặt tên là **`SKILL.md`**.
- YAML Frontmatter ở đầu file `SKILL.md` bắt buộc phải có `name` (trùng tên thư mục) và `description` (mô tả rõ vai trò và thời điểm kích hoạt skill).
