# Chính Sách Bảo Mật (Security Policy) - LupBI

**LupBI** cam kết đảm bảo an toàn thông tin và bảo mật dữ liệu cho hệ thống Phân tích Dữ liệu Thông minh. Chúng tôi đánh giá cao sự đóng góp của cộng đồng trong việc phát hiện và báo cáo các lỗ hổng bảo mật.

---

## 🛡️ Phiên Bản Được Hỗ Trợ (Supported Versions)

Các phiên bản dưới đây đang được chủ động theo dõi và phát hành các bản vá lỗi bảo mật:

| Phiên bản | Trạng thái hỗ trợ | Mức độ ưu tiên vá lỗi |
| :--- | :---: | :--- |
| `main` branch (Chính thức) | 🟢 **Được hỗ trợ** | Cao nhất (Vá lỗi ngay lập tức) |
| Release v0.x / Beta | 🟢 **Được hỗ trợ** | Vá lỗi theo chu kỳ Release |
| Các nhánh thử nghiệm / Draft | 🔴 **Không hỗ trợ** | Không áp dụng vá lỗi tự động |

---

## 🔒 Báo Cáo Lỗ Hổng Bảo Mật (Reporting a Vulnerability)

Nếu bạn phát hiện bất kỳ lỗ hổng bảo mật nào trong hệ thống **LupBI**, vui lòng tuân thủ quy trình **Responsible Disclosure** (Tiết lộ có trách nhiệm) như sau:

### 1. Kênh tiếp nhận thông tin
- **Email:** Gửi báo cáo chi tiết trực tiếp đến địa chỉ email: [huynhngoanhthai@gmail.com](mailto:huynhngoanhthai@gmail.com) hoặc tạo một **Security Advisory** bảo mật riêng tư trên GitHub Repository.
- **Vui lòng KHÔNG** tạo Issue công khai trên GitHub đối với các lỗ hổng bảo mật nghiêm trọng chưa được vá.

### 2. Thông tin cần cung cấp
Để giúp chúng tôi xác minh và xử lý nhanh chóng, bài báo cáo nên bao gồm:
- Loại lỗ hổng (ví dụ: XSS, SQL Injection, Broken Authentication, RBAC Bypass, JWT Leakage...).
- Các bước tái hiện lỗ hổng (Proof of Concept - PoC) hoặc kịch bản khai thác.
- Phạm ảnh hưởng ước tính (API, Frontend, Database, hay toàn bộ hệ thống).
- Gợi ý bản vá hoặc phương án khắc phục (nếu có).

### 3. Quy trình phản hồi & Xử lý
- **Xác nhận tiếp nhận:** Trong vòng **24–48 giờ** kể từ khi nhận được báo cáo, chúng tôi sẽ xác nhận lại thông tin.
- **Đánh giá & Vá lỗi:** Đội ngũ phát triển sẽ tiến hành phân tích mức độ ảnh hưởng, lập bản vá trên môi trường thử nghiệm và phát hành bản vá chính thức trong vòng **3–7 ngày** tùy độ nghiêm trọng.
- **Công bố:** Sau khi bản vá được triển khai an toàn, chúng tôi sẽ thông báo lại cho bạn và ghi nhận đóng góp (nếu bạn đồng ý).

 cảm ơn sự hợp tác và đóng góp của bạn để giúp hệ thống LupBI an toàn hơn! 🚀
