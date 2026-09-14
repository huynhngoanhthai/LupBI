# LupBI Backend API (`apps/api`)

Dịch vụ Backend API cho hệ thống LupBI, phát triển trên nền tảng **NestJS**, **Prisma ORM** và **TypeScript**.

---

## 🛠️ Công Nghệ & Thư Viện

- **Framework:** NestJS 10+
- **ORM:** Prisma ORM (PostgreSQL/MySQL)
- **Authentication:** Passport JWT, bcrypt (Password Hashing), HTTP-Only Refresh Token Cookie
- **Rate Limiting:** `@nestjs/throttler` (Chống tấn công Brute Force)
- **Shared Contracts:** `@lupbi/shared-types`

---

## 📁 Cấu Trúc Thư Mục

```text
apps/api/
├── prisma/
│   ├── schema.prisma          # Định nghĩa Database Schema & Models
│   └── seed.ts                # Dữ liệu khởi tạo môi trường dev/staging
├── src/
│   ├── modules/
│   │   └── auth/              # Module Xác thực (AUTH-01)
│   │       ├── auth.controller.ts
│   │       ├── auth.service.ts
│   │       ├── dto/
│   │       ├── guards/
│   │       └── strategies/
│   ├── prisma/                # Prisma Global Service
│   ├── app.module.ts
│   └── main.ts
```

---

## ⚡ API Endpoints Hiện Có

### Module Auth (`/api/v1/auth`)
- `POST /api/v1/auth/login`: Đăng nhập bằng Email & Mật khẩu (Trả về Access Token & set Refresh Token Cookie).
- `POST /api/v1/auth/refresh`: Làm mới Access Token thông qua Refresh Token Cookie.
- `POST /api/v1/auth/logout`: Xóa Refresh Token Cookie & hủy phiên.
- `GET /api/v1/auth/me`: Lấy thông tin tài khoản hiện tại (Yêu cầu JWT Bearer Token).

---

## 🚀 Chạy Môi Trường Local

```bash
# Chạy ở môi trường dev với hot-reload
pnpm --filter @lupbi/api dev

# Chạy unit tests
pnpm --filter @lupbi/api test
```
