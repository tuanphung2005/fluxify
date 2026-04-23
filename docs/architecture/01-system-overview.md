# 01. Tổng quan Hệ thống

## 1. Mục tiêu bài toán

Fluxify là nền tảng thương mại điện tử đa vai trò (Khách hàng, Người bán, Quản trị viên), cho phép:
- Khách hàng khám phá cửa hàng, đặt hàng, theo dõi đơn.
- Người bán quản lý sản phẩm, đơn hàng, mã giảm giá, thanh toán VietQR, trình dựng cửa hàng.
- Quản trị viên quản trị người dùng và cửa hàng.

## 2. Bên liên quan

- Khách hàng: ưu tiên trải nghiệm mua sắm và độ tin cậy đơn hàng.
- Người bán: ưu tiên tốc độ vận hành cửa hàng, thống kê và thanh toán.
- Quản trị viên: ưu tiên kiểm soát hệ thống, chặn tài khoản vi phạm.
- Nhóm phát triển: ưu tiên khả năng bảo trì và tốc độ phát hành.

## 3. Phạm vi chức năng

### Trong phạm vi
- Đăng ký, xác minh email, đăng nhập và quản lý phiên.
- Danh mục sản phẩm, giỏ hàng, danh sách yêu thích, đơn hàng.
- Đánh giá sản phẩm, trò chuyện khách hàng-người bán.
- Quản trị người bán/quản trị viên theo vai trò.
- Mẫu cửa hàng và các thành phần giao diện động.

### Ngoài phạm vi hiện tại
- Phân rã thành vi dịch vụ.
- Kho dữ liệu phân tích và báo cáo nâng cao.
- Cổng thanh toán đầy đủ nhiều nhà cung cấp (hiện ưu tiên tích hợp VietQR).
- Nền tảng giám sát an ninh và quan sát ở cấp doanh nghiệp.

## 4. Ranh giới hệ thống và tích hợp ngoài

- Ứng dụng lõi: Next.js App Router + Route Handlers.
- Lớp dữ liệu: Prisma + PostgreSQL.
- Tích hợp ngoài:
  - Cloudinary: tải lên phương tiện.
  - Resend: email xác minh, đặt lại mật khẩu, biên nhận đơn hàng.
  - VietQR: tạo mã QR thanh toán.

Tham chiếu:
- [C4 mức ngữ cảnh](../../charts/c4/c4-01-system-context.puml)
- [C4 mức vùng chứa](../../charts/c4/c4-02-container-view.puml)

## 5. Kiểu kiến trúc

Kiến trúc được chọn là nguyên khối mô-đun (modular monolith):
- UI, API, auth, truy cập dữ liệu nằm trong cùng codebase Next.js.
- Tách mô-đun theo miền thông qua app/api/*, lib/db/*, lib/api/*.
- Có thể tách dần thành dịch vụ riêng khi tải tăng.

Lý do chọn:
- Đơn giản hóa quy trình phát hành ở giai đoạn đồ án.
- Giữ độ phức tạp vận hành ở mức thấp.
- Vẫn đảm bảo ranh giới mô-đun rõ ràng để mở rộng.

## 6. Động lực kiến trúc

- Nền tảng bảo mật cho xác thực, phân quyền, kiểm tra đầu vào, giới hạn tần suất.
- Tính nhất quán dữ liệu khi tạo đơn và trừ tồn kho.
- Trải nghiệm tách dashboard theo vai trò và chat theo cơ chế polling.
- Khả năng mở rộng cho mức tải vừa trong bối cảnh môn học.

## 7. Liên kết sơ đồ và mã nguồn

- Ca sử dụng tổng thể: [uml-00-system-usecase-diagram.puml](../../charts/uml/uml-00-system-usecase-diagram.puml)
- Bảng Use Case theo actor: [07-use-case-specifications.md](07-use-case-specifications.md)
- Mô hình miền và quan hệ thực thể: [uml-01-domain-class-model.puml](../../charts/uml/uml-01-domain-class-model.puml)
- Phụ thuộc gói backend: [uml-02-backend-package-diagram.puml](../../charts/uml/uml-02-backend-package-diagram.puml)
- Luồng nghiệp vụ đặt hàng: [uml-03-checkout-sequence.puml](../../charts/uml/uml-03-checkout-sequence.puml)
- Hoạt động checkout: [uml-09-checkout-activity.puml](../../charts/uml/uml-09-checkout-activity.puml)
- Luồng dashboard người bán: [uml-04-vendor-operations-sequence.puml](../../charts/uml/uml-04-vendor-operations-sequence.puml)
- Vòng đời đơn hàng: [uml-07-order-state-machine.puml](../../charts/uml/uml-07-order-state-machine.puml)
- Kiến trúc, mẫu kiến trúc và mẫu thiết kế: [06-architecture-and-design-patterns.md](06-architecture-and-design-patterns.md)
