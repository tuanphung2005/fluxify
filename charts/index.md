# Sơ đồ kiến trúc

Thư mục này chứa mã nguồn PlantUML cho tài liệu kiến trúc Fluxify.

Để xem bộ tài liệu kiến trúc phần mềm đầy đủ (phạm vi, NFR, triển khai,
bảo mật, ADR và kiểm chứng), xem `docs/architecture/README.md`.

## Cấu trúc

- charts/shared: Các tệp dùng chung cho kiểu hiển thị và chú giải.
- charts/c4: Các sơ đồ kiến trúc theo mô hình C4.
- charts/uml: Các sơ đồ UML về hành vi và mô hình miền.

## Sơ đồ C4

- c4-01-system-context.puml: Ngữ cảnh hệ thống với tác nhân chính và dịch vụ bên ngoài.
- c4-02-container-view.puml: Ranh giới vùng chứa giữa giao diện, API, xác thực và dữ liệu.
- c4-03-order-processing-components.puml: Tương tác thành phần của phân hệ xử lý đơn hàng.
- c4-04-shop-builder-components.puml: Thành phần và luồng dữ liệu của phân hệ trình dựng cửa hàng.
- c4-05-chat-components.puml: Phân hệ chat và luồng kiểm tra tin nhắn chưa đọc.
- c4-06-vendor-admin-components.puml: Tương tác thành phần của quản lý người bán/quản trị.

## Sơ đồ UML

- uml-01-domain-class-model.puml: Mô hình lớp miền và quan hệ số lượng.
- uml-02-backend-package-diagram.puml: Bản đồ phụ thuộc gói backend.
- uml-03-checkout-sequence.puml: Luồng thanh toán và giao dịch tạo đơn.
- uml-04-vendor-operations-sequence.puml: Luồng thao tác nghiệp vụ trong bảng điều khiển người bán.
- uml-05-auth-registration-sequence.puml: Luồng đăng ký, xác minh và đăng nhập.
- uml-06-product-lifecycle-activity.puml: Quy trình tạo/cập nhật sản phẩm.
- uml-07-order-state-machine.puml: Chuyển trạng thái vòng đời đơn hàng.
- uml-08-shop-template-lifecycle-activity.puml: Vòng đời chỉnh sửa và xuất bản mẫu cửa hàng.

## Kiểm tra hợp lệ

Nếu đã cài PlantUML cục bộ, chạy kiểm tra cú pháp:

```powershell
Get-ChildItem charts -Recurse -Filter *.puml | ForEach-Object { plantuml -checkonly $_.FullName }
```
