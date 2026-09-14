# Antigravity Agent Customizations (`.agent`) - Dự án LupBI

Thư mục `.agent` chứa các quy định (**Rules**) và kỹ năng (**Skills**) giúp định hướng AI Agent làm việc chính xác, nhất quán và hiệu quả theo đúng quy trình của dự án **LupBI**.

---

## 📁 Cấu Trúc Thư Mục

```text
.agent/
├── AGENTS.md                            # Quy định chính thức cho Agent
├── README.md                            # Tài liệu hướng dẫn này
├── rules/                               # Định nghĩa các Nguyên tắc & Tiêu chuẩn (Rules)
│   ├── 00-general-rules.md              # Quy tắc dùng chung cho dự án LupBI
│   ├── ba-business-analyst.md           # Quy tắc phân tích nghiệp vụ cho BA
│   └── qa-tester.md                     # Quy tắc kiểm thử & nghiệm thu cho QA
├── plan/                                # Thư mục lưu trữ kế hoạch & thiết kế tính năng
│   ├── Đăng nhập & Quản lý Phiên AUTH-01.md
│   └── Phân quyền vai trò (RBAC) AUTH-02.md
└── skills/                              # Định nghĩa các Kỹ năng Quy trình (Skills)
    ├── ba-requirements-analysis/        # Skill BA: Phân tích & làm rõ yêu cầu nghiệp vụ
    │   └── SKILL.md
    ├── ba-user-story-generator/         # Skill BA: Viết User Story & Acceptance Criteria chuẩn BDD
    │   └── SKILL.md
    ├── ba-sync-backlog/                 # Skill BA: Đồng bộ & tra cứu backlog từ Google Sheet LupBI
    │   └── SKILL.md
    └── qa-test-execution/               # Skill QA: Kiểm thử RC, cập nhật % hoàn thành & ghi nhận nhận xét lỗi
        └── SKILL.md
```
