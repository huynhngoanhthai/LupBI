# Kế Hoạch & Phân Tích Kỹ Thuật: Phân quyền vai trò (RBAC) (AUTH-02)

## 📌 Thông Tin Tổng Quan
- **Mã tính năng:** `AUTH-02`
- **Tên tính năng:** Phân quyền vai trò (Role-Based Access Control - RBAC)
- **Module:** Xác thực & Phân quyền
- **Mức độ ưu tiên:** `P0 (Core MVP)`
- **Độ phức tạp:** `Trung bình`
- **Mô tả ngắn:** Phân chia quyền hạn sử dụng trong hệ thống LupBI gồm các nhóm vai trò cơ bản: **Admin** (toàn quyền quản trị), **Creator** (tạo query, chỉnh sửa dashboard), và **Viewer** (chỉ có quyền xem báo cáo/dashboard).

---

## 🎯 Bước 1: Khai Phá & Thu Thập Yêu Cầu (Discovery)
1. **Mục tiêu kinh doanh (Business Goal):** Phân định ranh giới trách nhiệm và quyền hạn thao tác trên hệ thống LupBI, đảm bảo người dùng chỉ được thực hiện đúng các hành động tương ứng với chức vụ/vai trò của mình.
2. **Đối tượng sử dụng (Actors):** Admin (Quản trị viên), Creator (Chuyên viên phân tích/Tạo báo cáo), Viewer (Người xem báo cáo).
3. **Phạm vi (Scope):**
   - **In-Scope:** Phân quyền 3 vai trò cơ bản (Admin, Creator, Viewer), kiểm tra quyền ở Frontend (UI elements, Route navigation) và Backend (Middleware API Guard).
   - **Out-of-Scope (Giai đoạn sau):** Phân quyền chi tiết tới cấp dòng dữ liệu (Row-Level Security - RLS), phân quyền theo phòng ban linh hoạt (Custom Roles).

---

## 👥 Bước 2: Ma Trận Phân Quyền (RBAC Matrix)

| Chức năng / Hành động | Admin | Creator | Viewer |
| :--- | :---: | :---: | :---: |
| Quản lý kết nối Database (Host, Port, Pass) | ✅ | ❌ | ❌ |
| Quản lý Người dùng & Phân quyền | ✅ | ❌ | ❌ |
| Viết & Thực thi SQL Query tự do (Monaco Editor) | ✅ | ✅ | ❌ |
| Tạo, Sửa, Xóa Saved Questions & Dashboards | ✅ | ✅ | ❌ |
| Xem Dashboards & Biểu đồ công khai/nội bộ | ✅ | ✅ | ✅ |
| Xuất dữ liệu báo cáo (CSV/Excel) | ✅ | ✅ | ✅ |

---

## 👤 Bước 3: User Story & Acceptance Criteria (BDD)

### User Story Statement
> Là một **Quản trị viên (Admin) hoặc Người sáng tạo (Creator)**,  
> Tôi muốn **Hệ thống phân chia quyền hạn truy cập theo Vai trò (Role)**,  
> Để **Đảm bảo bảo mật tài nguyên dữ liệu và ngăn chặn người dùng không có quyền chỉnh sửa/xóa báo cáo**.

### Scenario 1: Người dùng Viewer chỉ xem được dữ liệu, không thấy nút Edit/Delete (Happy Path)
- **Given** Người dùng đăng nhập với tài khoản có vai trò `Viewer`.
- **When** Truy cập vào một trang Dashboard bất kỳ.
- **Then** Giao diện ẩn hoàn toàn các nút "Edit Dashboard", "New Query", "Delete Widget".
- **And** Người dùng chỉ có thể thao tác lọc dữ liệu và xem biểu đồ.

### Scenario 2: Ngăn chặn truy cập API trái phép từ Backend (Security Enforcement)
- **Given** Người dùng `Viewer` cố tình gọi trực tiếp API `POST /api/v1/queries/run` để chạy SQL tự do.
- **When** Backend Middleware kiểm tra JWT Role của request.
- **Then** Backend từ chối thực thi, trả về lỗi `403 Forbidden` kèm thông báo "Bạn không có quyền thực hiện hành động này".

---

## 🏗️ Phân Phối Tác Vụ Kỹ Thuật (Task Breakdown)

### 1. Frontend (Next.js / React TS)
- [x] **Component Phân Quyền (`<PermissionGate />`):** Wrapper component nhận vào `allowedRoles` để ẩn/hiện các phần UI (menu, button, form).
- [x] **Navigation Guard:** Lọc danh sách Sidebar Menu / Action buttons theo role của user đang đăng nhập.
- [x] **User & Role Management UI:** Bảng danh sách người dùng dành riêng cho Admin, cho phép thay đổi vai trò (ADMIN, CREATOR, VIEWER) tức thì.

### 2. Backend (Node.js / Express / NestJS TS)
- [x] **Database Schema:** 
  - Bảng `users` (id, email, password_hash, full_name, role, is_active, created_at, updated_at). Vai trò gồm `ADMIN`, `CREATOR`, `VIEWER`.
- [x] **RBAC Middleware / Guard (`RolesGuard` & `@Roles(...)`):** 
  - Guard kiểm tra role từ Access Token JWT dùng NestJS Reflector.
  - Tích hợp `nestjs-i18n` tự động dịch câu thông báo `403 Forbidden` theo ngôn ngữ client (`vi`, `en`, `cn`).
- [x] **Admin Controller & Endpoints:**
  - `GET /api/v1/admin/users`: Lấy danh sách người dùng (Chỉ ADMIN).
  - `PATCH /api/v1/admin/users/:id/role`: Cập nhật vai trò (Chỉ ADMIN).

---

## 🧪 Bước 4: Quy Trình Kiểm Thử Release Candidate (RC Testing Steps)

### 1. Điều Kiện Tiên Quyết (RC Pre-conditions)
- Đã khởi tạo 3 tài khoản thử nghiệm trên CSDL SQLite:
  - Admin: `admin@lupbi.com` (Role: ADMIN)
  - Creator: `creator@lupbi.com` (Role: CREATOR)
  - Viewer: `viewer@lupbi.com` (Role: VIEWER)

### 2. Danh Sách Kịch Bản Kiểm Thử RC (RC Test Verification Checklist)

| STT | Tên kịch bản | Thao tác kiểm thử (Test Steps) | Kết quả kỳ vọng (Expected Output) | Trạng thái RC |
| :---: | :--- | :--- | :--- | :---: |
| **RC-01** | UI Visibility - Viewer | Đăng nhập `viewer@lupbi.com` -> Vào Dashboard | Không xuất hiện nút "Tạo Query Mới" hay bảng "Quản lý Người dùng" | 🟩 PASS |
| **RC-02** | UI Visibility - Creator | Đăng nhập `creator@lupbi.com` -> Vào Dashboard | Hiển thị nút "Tạo Query Mới", nhưng ẩn bảng "Quản lý Người dùng & Phân quyền" | 🟩 PASS |
| **RC-03** | Navigation Route Guard | Đăng nhập `viewer@lupbi.com` -> Cố tình vào endpoint Admin | Tự động chặn từ Middleware / Guard kèm thông báo 403 Forbidden | 🟩 PASS |
| **RC-04** | Backend API Protection | Dùng token của `viewer@lupbi.com` gọi `GET /api/v1/admin/users` | Trả về HTTP 403 Forbidden ("Bạn không có quyền thực hiện hành động này") | 🟩 PASS |
| **RC-05** | Admin Full Access | Đăng nhập `admin@lupbi.com` -> Xem bảng user & đổi role | Hiển thị toàn bộ user và đổi role thành công 100% | 🟩 PASS |

### 3. Tiêu Chí Hủy Bản RC (Rollback Criteria)
- ❌ **Security Violation:** Tài khoản Viewer có thể thực thi API Admin hoặc xem bảng quản lý phân quyền.

---

## 📊 Tiến Độ Hoàn Thành & Ghi Chú Nghiệm Thu (QA Sign-off & Feedback)

- **Tiến độ hoàn thành:** `100%`
- **Trạng thái:** `Passed RC Testing`

