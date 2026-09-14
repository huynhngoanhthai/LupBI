# Antigravity Agent Customizations (`.agent`) - Dự án LupBI

Thư mục `.agent` chứa các quy định (**Rules**) và kỹ năng (**Skills**) giúp định hướng AI Agent đóng vai trò **Business Analyst (BA)** làm việc chính xác, nhất quán và hiệu quả theo đúng quy trình của dự án **LupBI**.

---

## 📁 Cấu Trúc Thư Mục

```text
.agent/
├── README.md                            # Tài liệu hướng dẫn này
├── rules/                               # Định nghĩa các Nguyên tắc & Tiêu chuẩn (Rules)
│   ├── 00-general-rules.md              # Quy tắc dùng chung cho dự án LupBI
│   └── ba-business-analyst.md           # Quy tắc phân tích nghiệp vụ & tạo file kế hoạch cho BA
├── plan/                                # Nơi lưu trữ các bản thiết kế & phân tích tính năng
│   ├── Đăng nhập & Quản lý Phiên AUTH-01.md
│   └── Phân quyền vai trò (RBAC) AUTH-02.md
└── skills/                              # Định nghĩa các Kỹ năng Quy trình (Skills)
    ├── ba-requirements-analysis/        # Skill: Phân tích & làm rõ yêu cầu nghiệp vụ kèm kiểm thử RC
    │   └── SKILL.md
    ├── ba-user-story-generator/         # Skill: Viết User Story & Acceptance Criteria chuẩn BDD
    │   └── SKILL.md
    └── ba-sync-backlog/                 # Skill: Đồng bộ & tra cứu backlog từ Google Sheet LupBI
        └── SKILL.md
```

---

## 🏷️ Quy Chuẩn Đặt Tên (Naming Conventions)

### 1. Quy tắc đặt tên Rules (`.agent/rules/`)
- Tên file: `<role>-<topic>.md` (sử dụng chữ thường, phân cách bởi dấu gạch nối `-`).
- Các quy tắc chung áp dụng toàn dự án dùng tiền tố `00-` (ví dụ: `00-general-rules.md`).

### 2. Quy tắc đặt tên Skills (`.agent/skills/`)
- Thư mục Skill: `<role>-<skill-name>/` (sử dụng chữ thường, phân cách bởi dấu gạch nối `-`).
- File chính trong thư mục skill: Bắt buộc đặt tên là **`SKILL.md`**.
- YAML Frontmatter ở đầu file `SKILL.md` bắt buộc phải có `name` (trùng tên thư mục) và `description`.
