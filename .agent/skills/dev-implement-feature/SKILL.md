---
name: dev-implement-feature
description: >-
  Kích hoạt kỹ năng này khi Developer cần triển khai một tính năng kỹ thuật từ kế hoạch (.agent/plan/), làm rõ yêu cầu (/grill-me), xem trước UI (/generative_ui), thực thi kiên trì (/goal), và tách bạch chuẩn hóa mã nguồn Frontend và Backend kèm đồng bộ hóa Hợp đồng Dữ liệu (Contracts/Types).
---

# Kỹ Năng Triển Khai Tính Năng Kỹ Thuật (Dev Implement Feature)

Kỹ năng này hướng dẫn Developer (Dev) trong dự án **LupBI** cách tiếp nhận tài liệu kế hoạch từ `.agent/plan/`, làm rõ các quyết định thiết kế kiến trúc, trực quan hóa giao diện, phân tách độc lập 2 mã nguồn Frontend (`apps/web`) & Backend (`apps/api`), và đồng bộ hóa tuyệt đối hợp đồng dữ liệu (Contracts & Shared Types) cho đến khi nghiệm thu hoàn tất.

---

## 🎯 Các Nguyên Tắc Cốt Lõi

1. **Dựa trên Kế Hoạch (Plan-Driven):** Luôn lấy yêu cầu, tiêu chí nghiệm thu và RC Checklist từ tệp kế hoạch trong `.agent/plan/`.
2. **Tách Bạch Nguồn (FE & BE Separation):** Mã nguồn Frontend (`apps/web`) và Backend (`apps/api`) phải tách biệt độc lập theo cấu trúc monorepo Turborepo.
3. **Đồng Bộ Hóa Hợp Đồng Dữ Liệu (Single Contract of Truth):** Tất cả DTOs, Interface Request/Response và Enum được định nghĩa tập trung (tại `packages/shared-types` hoặc `packages/contracts`) để đảm bảo an toàn kiểu dữ liệu 100% TypeScript.
4. **Kiểm Soát Hiệu Năng & Triệt Tiêu Lỗi N+1 Query (Zero N+1 Query & High-Volume Safe):**
   - **Tuyệt đối cấm lỗi N+1:** Nghiêm cấm thực thi câu query database bên trong vòng lặp (`for`, `forEach`, `map`). Luôn sử dụng Eager Loading (`include`/`select` trong Prisma), JOIN hoặc DataLoader/batching.
   - **Sẵn sàng cho dữ liệu lớn:** Thiết kế phân trang (cursor/offset) và giới hạn `limit/take` tối đa ở API; áp dụng Virtual Scrolling ở Frontend để giao diện không bị giật lag khi hiển thị dữ liệu lớn.
5. **Kiên Trì Đến Cùng (`/goal` Execution):** Giải quyết dứt điểm toàn bộ task trong checklist, tự sửa lỗi build/lint, không dừng lại giữa chừng khi tính năng chưa hoàn chỉnh.

---

## 🛠️ Các Bước Thực Hiện Chi Tiết

### Bước 1: Tra Cứu Kế Hoạch & Làm Rõ Yêu Cầu (`/grill-me`)

1. **Quét danh sách kế hoạch:**
   - Đọc các tệp trong thư mục `.agent/plan/` (ví dụ: `Đăng nhập & Quản lý Phiên AUTH-01.md`, `Phân quyền vai trò (RBAC) AUTH-02.md`,...).
   - Hiển thị danh sách mã tính năng khả dụng và hỏi người dùng tính năng cần thực hiện.
2. **Phỏng vấn làm rõ theo phong cách `/grill-me`:**
   - Đặt câu hỏi chi tiết về các quyết định kỹ thuật còn phân vân: Volume dữ liệu ước tính, chiến lược phân trang (Pagination), Database constraints, mã lỗi HTTP, flow fallback, cấu hình bảo mật.
   - Luôn đặt câu hỏi kèm theo phương án khuyến nghị `(Recommended)` để người dùng phê duyệt nhanh chóng.

---

### Bước 2: Trực Quan Hóa Giao Diện & Luồng Trải Nghiệm (`/generative_ui`)

1. **Thiết kế mẫu xem trước (UI Preview):**
   - Sử dụng kỹ năng `/generative_ui` hoặc mã hóa sơ đồ HTML/Mermaid trực quan để mô phỏng form, dashboard widget, hoặc layout component.
2. **Thống nhất các trạng thái giao diện:**
   - Làm rõ 4 trạng thái cốt lõi: **Loading (Skeleton)**, **Empty (Không có dữ liệu)**, **Error (Báo lỗi thân thiện)**, và **Success (Hiển thị dữ liệu chuẩn)**.
   - Nhận phản hồi nhanh từ người dùng trước khi viết code giao diện chi tiết.

---

### Bước 3: Thiết Lập Hợp Đồng Dữ Liệu Dùng Chung (Contracts & Shared Types)

Trước khi viết logic cho FE hoặc BE, bắt buộc tạo hoặc cập nhật hợp đồng dữ liệu tại `packages/shared-types` (hoặc `packages/contracts`):

1. **Payload & DTO:** Khai báo Request Body, Query Parameters (kèm pagination params `page`, `limit`, `cursor`) và Response DTO.
2. **Enums & Constants:** Định nghĩa các hằng số dùng chung (Role, QueryStatus, ChartType, HTTP Error Codes).
3. **Kiểm tra tương thích:** Cả `apps/api` và `apps/web` đều import trực tiếp từ package này, loại bỏ 100% tình trạng lệch kiểu (type divergence).

---

### Bước 4: Tách Rõ & Triển Khai 2 Source FE & BE

```text
LupBI Monorepo/
├── packages/
│   └── shared-types/             <-- Bước 3: Định nghĩa Interfaces, DTOs, Enums
├── apps/
│   ├── api/                      <-- Bước 4.1: Backend (NestJS + Prisma)
│   │   ├── src/modules/<feature>/
│   │   │   ├── <feature>.controller.ts
│   │   │   ├── <feature>.service.ts
│   │   │   └── dto/
│   │   └── prisma/schema.prisma
│   └── web/                      <-- Bước 4.2: Frontend (Next.js App Router)
│       ├── app/(dashboard)/<feature>/
│       ├── components/<feature>/
│       └── hooks/use-<feature>.ts
```

#### 4.1. Backend (`apps/api` - NestJS)

- **Database Layer:** Cập nhật `schema.prisma`, tạo migration và seed dữ liệu nếu cần.
- **Service Layer (Anti N+1 & Big Data):**
  - **Triệt tiêu N+1 Query:** Khi truy vấn thực thể có quan hệ (1-N, N-N), luôn dùng Prisma `include`/`select` hoặc batch `findMany({ where: { id: { in: ids } } })`. Tuyệt đối không query DB trong vòng lặp `map`/`forEach`.
  - **Bảo vệ server trước tập dữ liệu lớn:** Bắt buộc áp dụng pagination (`take`, `skip` hoặc cursor), áp đặt max limit (ví dụ: `take <= 1000`) để ngăn chặn cạn kiệt RAM (OOM) hoặc nghẽn connection pool.
  - **Bảo mật & Dynamic DB Drivers:** Hash mật khẩu (bcrypt), mã hóa AES-256 credentials nguồn dữ liệu, kết nối dynamic connection pool (`pg`, `mysql2`, `@clickhouse/client`).
- **Controller Layer:** Định nghĩa RESTful endpoints, gắn Guard phân quyền JWT/RBAC, DTO validation pipes.

#### 4.2. Frontend (`apps/web` - Next.js App Router)

- **UI Components:** Xây dựng component với Tailwind CSS và shadcn/ui, hỗ trợ Dark Mode tối ưu cho Dashboard.
- **Tối ưu hiển thị dữ liệu lớn:**
  - Kết hợp **TanStack Table** và **`@tanstack/react-virtual`** để kích hoạt Virtual Scrolling; DOM chỉ render số lượng dòng hiển thị trên viewport (20-30 dòng) kể cả khi bảng nhận vào 100.000+ bản ghi.
- **Advanced BI Tools:** Tích hợp `@monaco-editor/react` cho trình gõ SQL hoặc `echarts-for-react` (Canvas mode) cho biểu đồ dữ liệu lớn.
- **Client State & Data Fetching:** Sử dụng TanStack Query (`useQuery`, `useMutation`) kết nối trực tiếp đến endpoints của Backend; xử lý mượt mà caching và optimistic updates.

---

### Bước 5: Thực Thi Hướng Mục Tiêu & Đồng Bộ Tuyệt Đối (`/goal`)

- Duyệt qua toàn bộ checklist trong phần **Task Breakdown** của file kế hoạch `.agent/plan/<Feature>.md`.
- Vừa code vừa kiểm tra liên kết: Endpoint BE tạo ra phải được FE gọi chính xác thông qua Shared Types.
- Tự động phát hiện và fix toàn bộ lỗi type TypeScript (`tsc --noEmit`), lỗi build Turborepo, thiếu import hoặc cấu hình biến môi trường `.env`.

---

### Bước 6: Kiểm Thử Nghiệm Thu & Kiểm Soát Hiệu Năng (RC Testing & Query Audit)

1. **Kiểm tra RC Pre-conditions:** Xác minh biến môi trường, kết nối database và build staging.
2. **Kiểm thử chịu tải & Dữ liệu lớn (High-Volume Stress Testing):**
   - Viết test case / integration test giả lập dataset lớn (seed 10.000+ dòng dữ liệu).
   - Kiểm tra thời gian phản hồi (Response time) của API < 500ms dưới tải dữ liệu lớn, không bị timeout hay nghẽn bộ nhớ.
3. **Audit kiểm toán truy vấn (Zero N+1 Verification):**
   - Bật Prisma query logging (`log: ['query']`) trong môi trường test để đếm số lượng câu SQL được sinh ra.
   - Đảm bảo số lượng câu truy vấn là hằng số \(O(1)\), không được tăng tỷ lệ thuận \(O(N)\) theo số lượng bản ghi trả về.
4. **Chạy kịch bản kiểm thử RC:** Thực hiện tuần tự các kịch bản test (Happy Path, Exception Path, Edge Cases) đã được định nghĩa trong bảng **RC Test Verification Checklist** của tệp kế hoạch.
5. **Cập nhật trạng thái:** Đánh dấu hoàn thành (`[x]`, `🟩 PASS`) các mục trong tệp kế hoạch và xuất báo cáo nghiệm thu rõ ràng cho người dùng.

### Bước 7: Hỏi & Push Code Lên Git Repository (Git Push Confirmation)

1. **Xác định nhánh Git hiện tại:** Kiểm tra tên nhánh đang hoạt động (ví dụ qua `git branch --show-current` hoặc `git status`).
2. **Hỏi xác nhận từ người dùng:** Hỏi trực tiếp người dùng có muốn commit và push mã nguồn vừa triển khai lên nhánh hiện tại (nêu rõ tên nhánh, ví dụ `main` hoặc `feature/AUTH-01`) hay không.
3. **Thực thi Push Code (khi người dùng đồng ý):**
   - Thực hiện `git add .`
   - Tạo commit theo chuẩn Conventional Commits (ví dụ: `feat(AUTH-01): hoàn thành tính năng Đăng nhập & Quản lý Phiên`).
   - Push code lên remote repository: `git push origin <tên-nhánh-hiện-tại>`.
   - Thông báo link/trạng thái push thành công cho người dùng.
