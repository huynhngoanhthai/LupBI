# Antigravity Agent Customizations (`.agent`) - Dự án LupBI

Thư mục `.agent` chứa các quy định (**Rules**) và kỹ năng (**Skills**) giúp định hướng AI Agent làm việc chính xác, nhất quán và hiệu quả theo đúng quy trình của dự án **LupBI**.

---

## 📁 Cấu Trúc Thư Mục Phân Theo Vai Trò

```text
.agent/
├── README.md                            # Tài liệu hướng dẫn này
├── rules/                               # Định nghĩa các Nguyên tắc & Tiêu chuẩn (Rules)
│   ├── 00-general-rules.md              # Quy tắc dùng chung cho tất cả các vai trò
│   ├── ba-business-analyst.md           # Quy tắc dành cho Business Analyst
│   ├── dev-developer.md                 # Quy tắc dành cho Software Developer
│   ├── qa-tester.md                     # Quy tắc dành cho QA / Software Tester
│   └── pm-project-manager.md            # Quy tắc dành cho Project Manager
└── skills/                              # Định nghĩa các Kỹ năng Quy trình (Skills)
    ├── ba-requirements-analysis/        # Skill: Phân tích & làm rõ yêu cầu nghiệp vụ
    │   └── SKILL.md
    ├── ba-user-story-generator/         # Skill: Viết User Story & Acceptance Criteria chuẩn BDD
    │   └── SKILL.md
    ├── ba-sync-backlog/                 # Skill: Đồng bộ & tra cứu backlog từ Google Sheet LupBI
    │   └── SKILL.md
    ├── dev-code-refactoring/            # Skill: Rà soát & Tối ưu hóa mã nguồn
    │   └── SKILL.md
    └── qa-test-case-generator/          # Skill: Thiết kế Kịch bản & Bộ Test Case toàn diện
        └── SKILL.md

```

---

## 🏷️ Quy Chuẩn Đặt Tên (Naming Conventions)

### 1. Quy tắc đặt tên Rules (`.agent/rules/`)
- Tên file: `<role>-<topic>.md` (sử dụng chữ thường, phân cách bởi dấu gạch nối `-`).
- Ví dụ: `ba-business-analyst.md`, `dev-developer.md`, `qa-tester.md`.
- Các quy tắc chung áp dụng toàn dự án dùng tiền tố `00-` (ví dụ: `00-general-rules.md`).

### 2. Quy tắc đặt tên Skills (`.agent/skills/`)
- Thư mục Skill: `<role>-<skill-name>/` (sử dụng chữ thường, phân cách bởi dấu gạch nối `-`).
- File chính trong thư mục skill: Bắt buộc đặt tên là **`SKILL.md`**.
- YAML Frontmatter ở đầu file `SKILL.md` bắt buộc phải có `name` (trùng tên thư mục) và `description` (mô tả rõ vai trò và thời điểm kích hoạt skill).

---

## 🚀 Hướng Dẫn Thêm Mới Skill / Rule

### Đổi mới/Thêm một Rule:
Tạo file Markdown mới trong `.agent/rules/` theo tiền tố vai trò tương ứng và viết rõ các yêu cầu/ràng buộc.

### Đổi mới/Thêm một Skill:
Tạo thư mục mới trong `.agent/skills/<role>-<skill-name>/` và tạo file `SKILL.md` với định dạng:

```markdown
---
name: <role>-<skill-name>
description: >-
  Mô tả chi tiết khi nào Agent nên kích hoạt kỹ năng này. Viết ở ngôi thứ 3.
---

# Tên Kỹ Năng

## Mục tiêu
...

## Các Bước Thực Hiện
1. ...
2. ...
```
