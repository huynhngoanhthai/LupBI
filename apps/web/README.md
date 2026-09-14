# LupBI Frontend Web (`apps/web`)

Ứng dụng Giao diện Người dùng (Frontend) cho hệ thống LupBI, phát triển trên nền tảng **Next.js 14+ (App Router)** và **Tailwind CSS**.

---

## 🛠️ Công Nghệ & Thư Viện

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS, Lucide React Icons
- **State Management & Fetching:** TanStack Query (React Query v5), Axios
- **Auth Management:** Zustand Store (`useAuthStore`)
- **Shared Types:** `@lupbi/shared-types`

---

## 📁 Cấu Trúc Thư Mục

```text
apps/web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/         # Trang Đăng Nhập (/login)
│   │   ├── (dashboard)/
│   │   │   └── dashboard/     # Trang Dashboard tổng quan (/dashboard)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── auth/              # Components Form Đăng nhập & Xác thực
│   ├── lib/
│   │   ├── api-client.ts      # Axios Instance & Interceptors
│   │   └── utils.ts
│   └── stores/
│       └── auth.store.ts      # Zustand Auth State Store
```

---

## 🚀 Chạy Môi Trường Local

```bash
# Chạy ứng dụng Next.js dev server
pnpm --filter @lupbi/web dev
```

Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:3000`.
