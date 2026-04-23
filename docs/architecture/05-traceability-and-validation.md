# 05. Ma trận Truy vết và Kế hoạch Kiểm chứng

## 1. Ma trận truy vết yêu cầu

| Yêu cầu | Mô tả | Sơ đồ liên quan | Thành phần mã nguồn | Bằng chứng kiểm thử |
|---|---|---|---|---|
| FR-01 | Đăng ký, xác minh email, đăng nhập | [uml-05](../../charts/uml/uml-05-auth-registration-sequence.puml) | app/api/auth/*, [lib/auth.ts](../../lib/auth.ts) | [tests/session-features.test.ts](../../tests/session-features.test.ts), [tests/env-validation.test.ts](../../tests/env-validation.test.ts) |
| FR-02 | Đặt hàng và cập nhật tồn kho | [uml-03](../../charts/uml/uml-03-checkout-sequence.puml), [uml-07](../../charts/uml/uml-07-order-state-machine.puml), [uml-09](../../charts/uml/uml-09-checkout-activity.puml) | app/api/orders/*, lib/db/ecommerce-queries.ts | [tests/order-stock.test.ts](../../tests/order-stock.test.ts), [tests/variant-stock-prevention.test.ts](../../tests/variant-stock-prevention.test.ts) |
| FR-03 | Quản lý bảng điều khiển người bán | [uml-04](../../charts/uml/uml-04-vendor-operations-sequence.puml), [c4-06](../../charts/c4/c4-06-vendor-admin-components.puml) | app/vendor/*, app/api/vendor/* | Kịch bản thủ công + kiểm thử khói API |
| FR-04 | Chat khách hàng-người bán | [c4-05](../../charts/c4/c4-05-chat-components.puml) | app/api/chat/* | [tests/chat-system.test.ts](../../tests/chat-system.test.ts), [tests/chat-sanitization.test.ts](../../tests/chat-sanitization.test.ts) |
| FR-05 | Đánh giá sản phẩm | [uml-01](../../charts/uml/uml-01-domain-class-model.puml) | app/api/reviews/* | [tests/reviews.test.ts](../../tests/reviews.test.ts) |
| FR-06 | Tải media có xác thực | [c4-02](../../charts/c4/c4-02-container-view.puml) | app/api/upload/*, lib/cloudinary.ts | [tests/upload-auth.test.ts](../../tests/upload-auth.test.ts) |
| FR-07 | Trình dựng cửa hàng (nháp/xuất bản) | [uml-08](../../charts/uml/uml-08-shop-template-lifecycle-activity.puml), [c4-04](../../charts/c4/c4-04-shop-builder-components.puml) | app/api/shop/* | Kịch bản thủ công + kiểm thử đơn vị mô-đun shop |
| FR-08 | Tăng cường bảo mật | [c4-03](../../charts/c4/c4-03-order-processing-components.puml) | lib/api/rate-limit.ts, validations | [tests/security-fixes.test.ts](../../tests/security-fixes.test.ts), [tests/lib/rate-limit.test.ts](../../tests/lib/rate-limit.test.ts) |

## 2. Kế hoạch kiểm chứng kiến trúc

### Hạng mục bắt buộc trước khi nộp
1. Lint: bun run lint
2. Tests: bun run test
3. Build: bun run build
4. Kiểm tra cú pháp PlantUML cho toàn bộ charts

Lệnh kiểm tra sơ đồ PlantUML:
Get-ChildItem charts -Recurse -Filter *.puml | ForEach-Object { plantuml -checkonly $_.FullName }

### Kịch bản nghiệp vụ cần trình bày
1. Khách hàng checkout thành công và tồn kho thay đổi chính xác.
2. Người bán cập nhật VietQR và nhận được mã QR hợp lệ.
3. Quản trị viên vô hiệu hóa user và middleware chặn truy cập.
4. Chat message chứa HTML độc hại được làm sạch.

## 3. Tiêu chí đạt

- Không có lỗi lint/build.
- Tất cả test xanh trên local và CI.
- Sơ đồ không có lỗi cú pháp.
- Mỗi FR trong ma trận có ít nhất 1 bằng chứng kiểm thử hoặc kịch bản demo.

## 4. Khoảng trống cần bổ sung sau môn học

1. Kiểm thử tải tự động hóa.
2. Kiểm thử đầu-cuối cho các hành trình người dùng đầy đủ.
3. Bảng điều khiển theo dõi runtime cho tỷ lệ lỗi và độ trễ.
