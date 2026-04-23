# Fluxify - Bộ tài liệu Kiến trúc Phần mềm

Tài liệu này bổ sung cho bộ sơ đồ C4/UML để đáp ứng yêu cầu nộp môn Kiến trúc phần mềm.

## 1. Phạm vi tài liệu

Bộ tài liệu gồm:
1. Mô tả bài toán, phạm vi, bên liên quan và ca sử dụng chính.
2. Bảng Use Case và đặc tả rút gọn cho các use case trọng tâm.
3. Kiến trúc, mẫu kiến trúc và các mẫu thiết kế có trong mã nguồn.
4. Yêu cầu phi chức năng (NFR) có chỉ số đo lường.
5. Góc nhìn triển khai và vận hành.
6. Bảo mật, rủi ro và biện pháp giảm thiểu.
7. Hồ sơ quyết định kiến trúc (ADR) cho các quyết định quan trọng.
8. Ma trận truy vết yêu cầu và kế hoạch kiểm chứng kiến trúc.

## 2. Thứ tự đọc để bảo vệ

1. [Tổng quan hệ thống](01-system-overview.md)
2. [Bảng Use Case và đặc tả rút gọn](07-use-case-specifications.md)
3. [Kiến trúc, mẫu kiến trúc và mẫu thiết kế](06-architecture-and-design-patterns.md)
4. [NFR và kịch bản chất lượng](02-quality-attributes-nfr.md)
5. [Triển khai và vận hành](03-deployment-and-operations.md)
6. [Bảo mật và quản trị rủi ro](04-security-and-risk.md)
7. [Chỉ mục ADR](adr/README.md)
8. [Truy vết và kiểm chứng kiến trúc](05-traceability-and-validation.md)

## 3. Liên kết bộ sơ đồ hiện có

### C4
- [Ngữ cảnh hệ thống](../../charts/c4/c4-01-system-context.puml)
- [Góc nhìn vùng chứa](../../charts/c4/c4-02-container-view.puml)
- [Thành phần xử lý đơn hàng](../../charts/c4/c4-03-order-processing-components.puml)
- [Thành phần trình dựng cửa hàng](../../charts/c4/c4-04-shop-builder-components.puml)
- [Thành phần chat](../../charts/c4/c4-05-chat-components.puml)
- [Thành phần quản lý người bán và quản trị](../../charts/c4/c4-06-vendor-admin-components.puml)

### UML
- [Use Case Diagram](../../charts/uml/uml-00-system-usecase-diagram.puml)
- [Mô hình lớp miền](../../charts/uml/uml-01-domain-class-model.puml)
- [Sơ đồ gói backend](../../charts/uml/uml-02-backend-package-diagram.puml)
- [Sơ đồ tuần tự thanh toán](../../charts/uml/uml-03-checkout-sequence.puml)
- [Sơ đồ tuần tự thao tác người bán](../../charts/uml/uml-04-vendor-operations-sequence.puml)
- [Sơ đồ tuần tự đăng ký và xác thực](../../charts/uml/uml-05-auth-registration-sequence.puml)
- [Sơ đồ hoạt động vòng đời sản phẩm](../../charts/uml/uml-06-product-lifecycle-activity.puml)
- [Máy trạng thái đơn hàng](../../charts/uml/uml-07-order-state-machine.puml)
- [Sơ đồ hoạt động vòng đời mẫu cửa hàng](../../charts/uml/uml-08-shop-template-lifecycle-activity.puml)
- [Sơ đồ hoạt động checkout](../../charts/uml/uml-09-checkout-activity.puml)

## 4. Danh sách kiểm tra hoàn thiện hồ sơ nộp môn

- [x] C4: ngữ cảnh, vùng chứa, thành phần
- [x] Use Case Diagram
- [x] Bảng Use Case / đặc tả use case
- [x] UML: cấu trúc + hành vi + trạng thái/hoạt động
- [x] Kiến trúc + mẫu kiến trúc + design patterns
- [x] Mô tả bên liên quan và phạm vi
- [x] NFR có số đo
- [x] ADR cho quyết định chính
- [x] Góc nhìn triển khai/vận hành
- [x] Góc nhìn bảo mật + sổ đăng ký rủi ro
- [x] Ma trận truy vết
- [x] Kế hoạch kiểm chứng + bản đồ bằng chứng

## 5. Cách cập nhật khi mã nguồn thay đổi

1. Cập nhật sơ đồ trong thư mục charts.
2. Cập nhật các file ADR nếu có thay đổi quyết định kiến trúc.
3. Cập nhật ma trận truy vết trong [05-traceability-and-validation.md](05-traceability-and-validation.md).
4. Chạy lại lint/test/build và cập nhật trạng thái bằng chứng.
