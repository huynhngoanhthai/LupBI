# Kế Hoạch & Phân Tích Kỹ Thuật: Đồng bộ Schema & Metadata (CONN-02)

## 📌 Thông Tin Tổng Quan
- **Mã tính năng:** `CONN-02`
- **Tên tính năng:** Đồng bộ Schema & Metadata (Schema & Metadata Synchronization)
- **Module:** Nguồn dữ liệu (Data Sources)
- **Mức độ ưu tiên:** `P0 (Core MVP)`
- **Độ phức tạp:** `Trung bình`
- **Mô tả ngắn:** Tự động quét và lập chỉ mục cấu trúc CSDL đích (Schemas, Tables, Views, Columns, Kiểu dữ liệu, Primary Keys) qua `information_schema`, lưu trữ vào CSDL metadata nội bộ để phục vụ Sidebar Tree-View và tính năng Auto-complete khi viết SQL.

---

## 🎯 Bước 1: Khai Phá & Thu Thập Yêu Cầu (Discovery)
1. **Mục tiêu kinh doanh (Business Goal):** Giúp người dùng phân tích dữ liệu (Creator, Data Analyst) dễ dàng khám phá cấu trúc dữ liệu, nắm bắt tên bảng và các cột có sẵn trong CSDL đích để viết truy vấn SQL nhanh chóng, chính xác mà không cần dùng tool ngoài (DBeaver, DataGrip, pgAdmin).
2. **Đối tượng sử dụng (Actors):**
   - **Admin:** Xem cây cấu trúc và kích hoạt quét/đồng bộ lại toàn bộ Metadata của các DataSource.
   - **Creator:** Xem cây cấu trúc phân cấp (Tree-View), tìm kiếm bảng/cột, sao chép nhanh tên cột vào SQL Editor, kích hoạt "Sync Metadata" thủ công khi CSDL đích có thay đổi.
   - **Viewer:** Không trực tiếp xem schema cây thư mục.
3. **Phạm vi (Scope):**
   - **In-Scope:**
     - Quét danh sách Schema (e.g. `public`), Tables, Views từ CSDL đích (PostgreSQL, MySQL, ClickHouse, SQLite).
     - Quét danh sách Columns: Tên cột (`column_name`), Kiểu dữ liệu gốc (`data_type`), Cho phép null (`is_nullable`), Thứ tự cột (`ordinal_position`), Khóa chính (`is_primary_key`).
     - Lưu trữ kết quả quét vào CSDL nội bộ LupBI (bảng `cached_schemas`, `cached_tables`, `cached_columns`) để trả về siêu tốc (< 50ms) cho Client.
     - Endpoint API đồng bộ thủ công `POST /api/v1/datasources/:id/sync-schema`.
     - Frontend Schema Tree-View Component có ô Search Filter (tìm kiếm realtime theo tên bảng/cột) và biểu tượng trực quan theo kiểu dữ liệu (Text, Number, Date/Time, Boolean).
   - **Out-of-Scope (Giai đoạn sau):** Quét Foreign Keys liên kết tự động vẽ ERD động, tự động phân tích dữ liệu mẫu (Data Profiling/Summary Stats: Min/Max/Null count).

---

## ⚙️ Bước 2: Yêu Cầu Chức Năng & Phi Chức Năng

### Yêu Cầu Chức Năng (Functional Requirements)
- `FR-META-01`: Hệ thống cung cấp adapter chuyên biệt để truy vấn `information_schema` phù hợp với từng hệ quản trị:
  - **PostgreSQL:** Truy vấn `information_schema.tables` và `information_schema.columns`.
  - **MySQL:** Truy vấn `information_schema.tables` và `information_schema.columns` theo `table_schema = DATABASE()`.
  - **ClickHouse:** Truy vấn `system.tables` và `system.columns`.
  - **SQLite:** Truy vấn `sqlite_master` và `PRAGMA table_info()`.
- `FR-META-02`: Khi tạo mới DataSource thành công (từ `CONN-01`), hệ thống tự động trigger một background job đồng bộ metadata lần đầu.
- `FR-META-03`: Nút "Sync Schema" tại giao diện cho phép Creator/Admin làm mới lại danh mục bảng biểu khi có thay đổi cấu trúc ở CSDL đích.
- `FR-META-04`: Frontend Tree-View hiển thị phân cấp: `Data Source > Schema > [Tables / Views] > Columns` kèm Icon chuẩn cho từng kiểu dữ liệu:
  - 🔤 String / Varchar / Text
  - 🔢 Integer / Decimal / Float / BigInt
  - 📅 Date / Time / Timestamp
  - 🔘 Boolean
  - 🔑 Primary Key Badge
- `FR-META-05`: Hỗ trợ tính năng "Click to Insert" hoặc "Copy Column Name" để chèn nhanh tên bảng/cột vào trình soạn thảo SQL.

### Yêu Cầu Phi Chức Năng (Non-Functional Requirements)
- `NFR-META-01`: API lấy metadata đã cache `GET /api/v1/datasources/:id/schema` phải phản hồi dưới 100ms ngay cả với CSDL có hơn 500 bảng.
- `NFR-META-02`: Quá trình đồng bộ metadata (Sync job) không được chiếm giữ lock hoặc làm ảnh hưởng đến hiệu năng của CSDL đích (sử dụng query READ ONLY với timeout 10s).
- `NFR-META-03`: Cập nhật metadata theo cơ chế Transaction/Upsert nguyên tử để tránh trạng thái dữ liệu rác khi tiến trình đồng bộ bị ngắt giữa chừng.

---

## 👤 Bước 3: User Story & Acceptance Criteria (BDD)

### User Story Statement
> Là một **Người tạo báo cáo / Phân tích dữ liệu (Creator)**,  
> Tôi muốn **Xem cây thư mục cấu trúc Schema, Bảng và Kiểu dữ liệu của Database đích**,  
> Để **Nắm rõ cấu trúc dữ liệu và viết câu truy vấn SQL dễ dàng, không bị sai tên bảng hay tên cột**.

### Scenario 1: Xem cây danh mục Schema và tìm kiếm bảng (Happy Path)
- **Given** Creator đang ở màn hình SQL Editor (`/queries/new`) và đã chọn Data Source `Production PostgreSQL`.
- **When** Creator mở thanh bên trái (Schema Explorer).
- **Then** Cây thư mục hiển thị danh sách các bảng thuộc schema `public` kèm số lượng cột.
- **And** Khi gõ từ khóa `order` vào ô tìm kiếm, danh sách tự động lọc hiển thị các bảng `orders`, `order_items` và các cột liên quan.

### Scenario 2: Đồng bộ lại Schema khi Database đích thêm bảng mới (Manual Sync)
- **Given** Database đích vừa được DBA thêm bảng mới `vouchers`.
- **When** Creator nhấn nút "Sync Schema" (icon xoay vòng) trên header của Schema Explorer.
- **Then** Hệ thống gửi request quét lại CSDL đích, hiển thị loading indicator và cập nhật bảng `vouchers` vào cây thư mục trong vòng < 3 giây kèm thông báo "Đồng bộ metadata thành công".

### Scenario 3: Bấm vào tên cột để sao chép hoặc chèn vào editor
- **Given** Cây thư mục đang mở rộng bảng `orders` hiển thị danh sách cột (`id`, `user_id`, `total_amount`, `created_at`).
- **When** Creator click vào cột `total_amount`.
- **Then** Tên cột `total_amount` được sao chép vào clipboard (hoặc tự động chèn vào vị trí con trỏ của Monaco SQL Editor).

---

## 🏗️ Phân Phối Tác Vụ Kỹ Thuật (Task Breakdown)

### 1. Database & Shared Types
- [ ] **Prisma Schema (Metadata Cache models):**
  ```prisma
  model CachedTable {
    id           String         @id @default(cuid())
    dataSourceId String         @map("data_source_id")
    schema       String         @default("public")
    tableName    String         @map("table_name")
    tableType    String         @default("TABLE") // TABLE | VIEW
    columns      CachedColumn[]
    updatedAt    DateTime       @updatedAt @map("updated_at")

    @@unique([dataSourceId, schema, tableName])
    @@map("cached_tables")
  }

  model CachedColumn {
    id          String      @id @default(cuid())
    tableId     String      @map("table_id")
    name        String
    dataType    String      @map("data_type") // varchar, int4, timestamp...
    normalizedType String   @map("normalized_type") // string, number, datetime, boolean
    isNullable  Boolean     @default(true) @map("is_nullable")
    isPrimaryKey Boolean    @default(false) @map("is_primary_key")
    position    Int         @default(0)
    table       CachedTable @relation(fields: [tableId], references: [id], onDelete: Cascade)

    @@map("cached_columns")
  }
  ```
- [ ] **Shared Types DTOs (`packages/shared-types`):**
  - `TableMetadataDto`, `ColumnMetadataDto`, `DataSourceSchemaResponseDto`, `SyncSchemaResultDto`.

### 2. Backend (NestJS / Express TS)
- [ ] **Metadata Scanner Service (`MetadataScannerService`):**
  - Viết SQL queries đặc thù cho từng driver (`PG`, `MySQL`, `ClickHouse`, `SQLite`).
  - Hàm chuẩn hóa kiểu dữ liệu (`normalizeDataType`: `varchar/text` -> `STRING`, `int/bigint/numeric` -> `NUMBER`, `timestamptz/date` -> `DATETIME`, `bool` -> `BOOLEAN`).
- [ ] **Sync Schema Manager:**
  - Thực thi transaction xóa / upsert metadata cache mới vào DB nội bộ LupBI.
- [ ] **Controller Endpoints:**
  - `GET /api/v1/datasources/:id/schema`: Trả về toàn bộ cấu trúc tree metadata đã cache.
  - `POST /api/v1/datasources/:id/sync-schema`: Trigger tiến trình quét đồng bộ lại CSDL đích.

### 3. Frontend (Next.js / React TS)
- [ ] **UI Component `SchemaExplorer` (`apps/web`):**
  - Cây phân cấp lồng nhau (Accordion / Tree View) với icon tương ứng: Bảng 🗃️, View 👁️, Kiểu dữ liệu (🔤, 🔢, 📅, 🔘, 🔑).
  - Thanh tìm kiếm realtime (Instant Filter) lọc bảng và cột.
  - Nút bấm "Sync" kèm hiệu ứng xoay (Spinning Animation).
- [ ] **Integration Monaco Editor:**
  - Tích hợp hook cung cấp schema metadata cho Monaco Editor Completion Provider (`monaco.languages.registerCompletionItemProvider`).

---

## 🔀 Sơ Đồ Luồng Đồng Bộ Metadata (Mermaid Flowchart)

```mermaid
flowchart TD
    A[Creator / Admin bấm 'Sync Schema'] --> B[FE: POST /api/v1/datasources/:id/sync-schema]
    B --> C[BE: Lấy kết nối DB từ Connection Pool]
    C --> D{Kiểm tra loại CSDL}
    D -- PostgreSQL --> E[Query information_schema.tables & columns]
    D -- MySQL --> F[Query information_schema với schema = DB()]
    D -- ClickHouse --> G[Query system.tables & system.columns]
    D -- SQLite --> H[Query sqlite_master & PRAGMA table_info]
    E --> I[Chuẩn hóa Normalized Data Types]
    F --> I
    G --> I
    H --> I
    I --> J[BE: Lưu kết quả vào cached_tables & cached_columns]
    J --> K[BE: Trả về kết quả hoàn tất SyncSchemaResultDto]
    K --> L[FE: Cập nhật lại Tree-View & Thông báo thành công]
```

---

## 🧪 Bước 4: Quy Trình Kiểm Thử Release Candidate (RC Testing Steps)

### 1. Điều Kiện Tiên Quyết (RC Pre-conditions)
- Đã tạo sẵn ít nhất 1 DataSource hoạt động thành công (từ `CONN-01`).
- CSDL đích có sẵn ít nhất 3 bảng với các kiểu dữ liệu đa dạng (chuỗi, số nguyên, số thực, ngày giờ, boolean, primary key).
- Đăng nhập bằng tài khoản `creator@lupbi.com` hoặc `admin@lupbi.com`.

### 2. Danh Sách Kịch Bản Kiểm Thử RC (RC Test Verification Checklist)

| STT | Tên kịch bản | Thao tác kiểm thử (Test Steps) | Kết quả kỳ vọng (Expected Output) | Trạng thái RC |
| :---: | :--- | :--- | :--- | :---: |
| **RC-META-01** | Tự Động Quét Metadata Lần Đầu | Thêm DataSource mới thành công | CSDL nội bộ lưu trữ đầy đủ danh sách bảng/cột của DB đích mà không cần bấm nút sync | `[----------] 0%` |
| **RC-META-02** | Xem Cây Phân Cấp Tree-View | Mở Schema Explorer tại trang `/queries/new` | Hiển thị đúng danh sách Tables, bấm mở rộng từng bảng hiển thị đúng danh sách Cột kèm Icon kiểu dữ liệu | `[----------] 0%` |
| **RC-META-03** | Tìm Kiếm Bảng & Cột Realtime | Nhập tên 1 cột bất kỳ vào ô Search | Cây thư mục tự động lọc và mở rộng đúng bảng chứa cột đó | `[----------] 0%` |
| **RC-META-04** | Đồng Bộ Thủ Công (Sync Button) | Thêm 1 bảng mới ở DB đích -> Bấm icon "Sync Schema" trên UI | Bảng mới xuất hiện trên UI trong vòng < 3s, thông báo toast "Đồng bộ thành công" | `[----------] 0%` |
| **RC-META-05** | Nhận Diện Đúng Kiểu Dữ Liệu | Kiểm tra cột kiểu `VARCHAR`, `INT4`, `TIMESTAMP`, `BOOLEAN` | Cột hiển thị đúng nhãn chuẩn hóa tương ứng (`STRING`, `NUMBER`, `DATETIME`, `BOOLEAN`) | `[----------] 0%` |
| **RC-META-06** | Tốc Độ Phản Hồi Cache Schema | Gọi API `GET /api/v1/datasources/:id/schema` liên tục 5 lần | Thời gian phản hồi < 50ms (lấy trực tiếp từ cache DB nội bộ, không query lại DB đích) | `[----------] 0%` |

### 3. Tiêu Chí Hủy Bản RC (Rollback Criteria)
- ❌ **Blocker:** Tiến trình Sync bị treo vô tận hoặc gây lỗi out-of-memory khi quét CSDL có nhiều schema/bảng.
- ❌ **Data Loss:** Lỗi transaction làm mất toàn bộ cache schema cũ khi tiến trình sync mới gặp sự cố mạng.

---

## 📊 Tiến Độ Hoàn Thành & Ghi Chú Nghiệm Thu (QA Sign-off & Feedback)

- **Tiến độ hoàn thành:** `[----------] 0%` (Chờ triển khai & kiểm thử)
- **UI:** `[----------] 0%`
- **BE:** `[----------] 0%`
- **DB:** `[----------] 0%`
- **Trạng thái:** `Ready for Dev`

### 📝 Ghi Chú & Nhận Xét Từ QA (Tester Notes)
*(Chờ QA chạy skill kiểm thử nghiệm thu `qa-test-execution` để điền phần trăm % hoàn thành và các nhận xét về Lỗi nghiệp vụ, UI xấu, Tốc độ chậm, Khó thao tác, Sai cấu trúc...)*
