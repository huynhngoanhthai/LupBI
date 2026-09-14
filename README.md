# LupBI — Hệ Thống Phân Tích Dữ Liệu Thông Minh (Business Intelligence System)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/built%20with-Turborepo-ef4444.svg)](https://turbo.build/)

**LupBI** là nền tảng Phân tích Dữ liệu và Báo cáo Thông minh (Business Intelligence Platform) được thiết kế hiện đại, tốc độ cao, hỗ trợ trực quan hóa số liệu kinh doanh, phân quyền bảo mật chặt chẽ và xử lý dữ liệu quy mô lớn cho doanh nghiệp.

---

## 🏗️ Kiến Trúc Hệ Thống (Monorepo Architecture)

Dự án được cấu trúc dạng **Monorepo** quản lý bằng **pnpm Workspaces** và **Turborepo**:

```text
LupBI/
├── apps/
│   ├── web/                   # Frontend: Next.js 14+ (App Router), Tailwind CSS, TanStack Query/Table
│   └── api/                   # Backend: NestJS 10+, Prisma ORM, JWT Authentication, PostgreSQL
├── packages/
│   └── shared-types/          # Shared Types, DTOs & Contracts dùng chung cho FE & BE
├── .agent/                    # Hệ thống Quy định (Rules), Kế hoạch (Plan) & Kỹ năng (Skills) của AI Agent
└── docker-compose.yml         # Cấu hình môi trường dịch vụ (Database, Cache)
```

---

## ✨ Các Tính Năng Hệ Thống (Feature Roadmap)

| Mã tính năng | Tên tính năng | Module | Tiến độ | Trạng thái |
| :---: | :--- | :--- | :---: | :---: |
| `AUTH-01` | Đăng nhập & Quản lý Phiên | Xác thực & Phân quyền | `[==========] 100%` | 🟩 **RC Approved** |
| `AUTH-02` | Phân quyền vai trò (RBAC) | Xác thực & Phân quyền | `[==========] 100%` | 🟩 **RC Approved** |

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Frontend (`apps/web`)
- **Framework:** Next.js 14+ (App Router, Server & Client Components)
- **Styling:** Tailwind CSS, Lucide Icons, Shadcn/UI
- **State & Data Fetching:** TanStack Query (React Query v5), Zustand
- **Large Data Rendering:** TanStack Table v8, `@tanstack/react-virtual` (Virtual Scrolling)

### Backend (`apps/api`)
- **Framework:** NestJS (TypeScript, Dependency Injection, Modular System)
- **Database & ORM:** PostgreSQL / MySQL, Prisma ORM
- **Security & Auth:** Passport.js JWT, bcrypt, Rate Limiting (`@nestjs/throttler`), HTTP-Only Cookies
- **API Standard:** RESTful API chuẩn camelCase / DTO validation

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Môi Trường Local

### 1. Yêu cầu tiên quyết
- Node.js `>= 18.0.0`
- pnpm `>= 8.0.0`

### 2. Cài đặt Dependencies
```bash
pnpm install
```

### 3. Cấu hình biến môi trường
Tạo tệp `.env` tại `apps/api` và `apps/web` dựa trên mẫu:
```env
# apps/api/.env
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/lupbi_db?schema=public"
JWT_ACCESS_SECRET="your_jwt_access_secret_key"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_key"

# apps/web/.env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 4. Chạy ứng dụng ở môi trường Development
```bash
# Chạy đồng thời cả Frontend và Backend
pnpm dev
```

- **Frontend App:** http://localhost:3000
- **Backend API:** http://localhost:3001

---

## 🧪 Kiểm Thử (Testing)

```bash
# Chạy Unit Test cho toàn bộ monorepo
pnpm test

# Chạy test cho riêng backend API
pnpm --filter @lupbi/api test
```

---

## 🛡️ Bảo Mật & Quy Chuẩn (Security & Standards)

- Vui lòng tham khảo tệp [SECURITY.md](SECURITY.md) để biết chính sách bảo mật và báo cáo lỗ hổng.
- Quy chuẩn phát triển & kế hoạch chi tiết lưu tại thư mục [.agent/](.agent/README.md).

---

## 📄 License
Dự án được phát hành theo giấy phép [MIT License](LICENSE).