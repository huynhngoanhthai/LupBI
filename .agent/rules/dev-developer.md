# Quy Tắc Dành Cho Vai Trò Developer (Dev)

Khi đóng vai trò **Developer (Dev)** trong dự án LupBI, Agent phải tuân thủ nghiêm ngặt các nguyên tắc kiến trúc và lập trình sau:

---

## 0. Bộ Công Nghệ Chuẩn (Official Tech Stack - Single Source of Truth)
Mọi quyết định lập trình, thiết kế kiến trúc và cài đặt thư viện phải tuân thủ nghiêm ngặt bảng công nghệ tại:
- **Sheet Tech URL:** `https://docs.google.com/spreadsheets/d/1VMBCnGfS0nSFEDR33RLht5SFNOkQQwCgW4GpXVoX7QU/edit?gid=63425449#gid=63425449`
- **CSV Export URL:** `https://docs.google.com/spreadsheets/d/1VMBCnGfS0nSFEDR33RLht5SFNOkQQwCgW4GpXVoX7QU/gviz/tq?tqx=out:csv&gid=63425449`

### Chi tiết 4 tầng kiến trúc (100% TypeScript Fullstack):
1. **Kiến trúc tổng thể (Monorepo):**
   - Công cụ: **Turborepo** (kết hợp pnpm workspaces).
   - Chia sẻ trực tiếp Interface/Type TypeScript giữa FE và BE (`QueryPayload`, `ChartConfig`, `UserSession`,...).
2. **Backend:**
   - Web/API Framework: **NestJS** (cấu trúc Module, Dependency Injection phân lớp rõ ràng).
   - ORM CSDL nội bộ: **Prisma** (PostgreSQL/SQLite metadata: users, dashboards, saved queries).
   - Database Drivers: **`pg`**, **`mysql2/promise`**, **`@clickhouse/client`** (dynamic connection pool kết nối CSDL phân tích).
   - Bảo mật & Quản lý phiên: **`@nestjs/jwt`**, **`bcrypt`**, Node.js **`crypto`** (AES-256 mã hóa credentials kết nối).
3. **Frontend:**
   - Web Framework: **Next.js (App Router)**.
   - State & Data Fetching: **TanStack Query (React Query)** (cache kết quả, background refetching).
   - SQL Editor: **`@monaco-editor/react`** (chuẩn VS Code, syntax highlighting, autocomplete, Ctrl+Enter).
   - Visualization: **Apache ECharts (`echarts-for-react`)** (Canvas rendering hiệu năng cao).
   - Dashboard Grid: **`react-grid-layout`** (kéo thả, co giãn biểu đồ).
   - Result Table: **TanStack Table** + **`@tanstack/react-virtual`** (virtualized table cho dữ liệu lớn).
   - UI Library: **shadcn/ui + Tailwind CSS** (tối ưu Dark Mode cho màn hình Dashboard).
4. **DevOps & Hạ tầng:**
   - Containerization: **Docker & Docker Compose**.
   - Caching: **Redis** (cache metadata schema và query lặp lại).

---

## 1. Nguyên Tắc Lập Trình & Clean Code
- **DRY (Don't Repeat Yourself):** Tái sử dụng hàm/component, tránh viết lặp code.
- **KISS (Keep It Simple, Stupid):** Giữ giải pháp đơn giản, dễ hiểu, tránh phức tạp hóa không cần thiết.
- **SOLID:** Tuân thủ các nguyên tắc thiết kế hướng đối tượng / module.

## 2. Quy Chuẩn Đặt Tên (Naming Conventions)
- Biến & Hàm: `camelCase` (ví dụ: `calculateMonthlyRevenue`, `isUserActive`).
- Class & Interface & Component: `PascalCase` (ví dụ: `UserProfile`, `ReportService`).
- Hằng số (Constants): `UPPER_SNAKE_CASE` (ví dụ: `MAX_RETRY_LIMIT`, `API_BASE_URL`).

## 3. Quản Lý Mã Nguồn & Commit
- Message Commit chuẩn: `<type>(<scope>): <short description>`
  - `feat`: Tính năng mới.
  - `fix`: Sửa lỗi.
  - `refactor`: Cải thiện cấu trúc code không thay đổi tính năng.
  - `docs`: Cập nhật tài liệu.

## 4. Xử Lý Lỗi & Logging
- Tránh nuốt ngoại lệ (silent try/catch mà không log lỗi).
- Log lỗi đầy đủ ngữ cảnh để hỗ trợ trace bug nhanh chóng.

## 5. Tối Ưu CSDL & Triệt Tiêu Lỗi N+1 Query (Zero N+1 Query Policy)
- **Nghiêm cấm N+1 Query:** Không bao giờ thực thi truy vấn CSDL trong vòng lặp (`for`, `map`, `forEach`). Bắt buộc dùng Eager Loading (`include`, `select` trong Prisma), `JOIN` hoặc batching (`where: { id: { in: ids } }`).
- **Xử lý tập dữ liệu lớn:**
  - Luôn áp dụng phân trang (Pagination với cursor hoặc `take/skip`) cho các API danh sách.
  - Áp đặt giới hạn `maxLimit` (ví dụ: `take <= 1000`) để tránh tràn RAM server (OOM).
- **Kiểm thử hiệu năng:** Bắt buộc viết test case giả lập dữ liệu lớn và audit log query để đảm bảo số câu query là hằng số \(O(1)\).

## 6. Quy Định Đa Ngôn Ngữ (i18n Standard - Default: Tiếng Việt)
- **Cấu trúc lưu trữ:**
  - Backend: `./i18n/api/translate.csv` và các file ngôn ngữ đầu ra (`vi.json`, `en.json`, `cn.json`,...).
  - Frontend: `./i18n/web/translate.csv` và các file ngôn ngữ đầu ra (`vi.json`, `en.json`, `cn.json`,...).
- **Quy tắc tìm đường dẫn i18n ở Backend (Triệt tiêu I18nError path not found):**
  - Khi cấu hình `I18nModule` trong NestJS, tuyệt đối không dùng duy nhất `path.join(process.cwd(), 'i18n/api')`.
  - Bắt buộc dùng hàm kiểm tra vị trí ứng viên bằng `fs.existsSync(...)` (`process.cwd()`, `../../i18n/api`, `../i18n/api`, `__dirname` relative) để ứng dụng luôn tìm thấy thư mục `i18n/api` bất kể được khởi động từ Root Monorepo, `apps/api`, `dist/` hay Jest tests.
- **Quy trình cập nhật:**
  - Ngôn ngữ mặc định của ứng dụng là **Tiếng Việt (`vi`)**.
  - Khi thêm/sửa nhãn hoặc thông báo lỗi mới, Developer ghi vào `translate.csv` tương ứng và thực thi lệnh `pnpm i18n:split` để đồng bộ ra các file `.json`.
  - Không hardcode chuỗi ký tự hiển thị trực tiếp trong mã nguồn FE hay BE.

## 7. Quy Định Kết Nối Frontend (UI) & Backend (API) Bắt Buộc
- Bắt buộc triển khai đồng thời 100% cả Backend API (`apps/api`) và Frontend UI (`apps/web`) kết nối trực tiếp qua TanStack Query / Axios cho mọi tính năng.
- Tuyệt đối nghiêm cấm việc báo hoàn thành hoặc nghiệm thu nếu chỉ phát triển phần Backend API mà chưa có giao diện Frontend UI tương ứng (hoặc ngược lại).
- Mọi tính năng phải sẵn sàng cho người dùng thao tác trực quan trên trình duyệt.




