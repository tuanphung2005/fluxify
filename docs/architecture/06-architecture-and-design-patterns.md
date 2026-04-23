# 06. Kiến trúc, Mẫu kiến trúc và Mẫu thiết kế

Tài liệu này chốt rõ loại kiến trúc, mẫu kiến trúc và các design pattern đang được dùng thực tế trong mã nguồn Fluxify để bám sát rubric của đề tài.

## 1. Kiến trúc hệ thống được chọn

Fluxify chọn **kiến trúc nguyên khối mô-đun (modular monolith)**, thuộc nhóm **Monolith**.

| Phương án | Mức phù hợp với dự án | Nhận xét |
|---|---|---|
| Monolith (được chọn) | Cao | Một codebase Next.js, một pipeline build/deploy, dễ truy vết toàn bộ luồng UI -> API -> DB trong phạm vi đồ án |
| SOA | Trung bình | Có thể tách theo dịch vụ nghiệp vụ, nhưng làm tăng chi phí tích hợp và vận hành khi nhóm phát triển nhỏ |
| Microservice | Thấp ở giai đoạn hiện tại | Đòi hỏi triển khai, giám sát, phân tán giao dịch và quản trị hạ tầng phức tạp hơn nhu cầu môn học |

### Minh chứng trong mã nguồn

- Ứng dụng được đóng gói như một đơn vị triển khai duy nhất qua [Dockerfile](../../Dockerfile) và [package.json](../../package.json).
- Giao diện, API và xác thực cùng nằm trong một codebase Next.js:
  - [app/(main)](../../app/(main))
  - [app/vendor](../../app/vendor)
  - [app/admin](../../app/admin)
  - [app/api](../../app/api)
  - [middleware.ts](../../middleware.ts)
- Lớp dữ liệu tập trung qua [lib/prisma.ts](../../lib/prisma.ts) và [prisma/schema.prisma](../../prisma/schema.prisma).

Kết luận: hệ thống không tách thành nhiều service độc lập theo kiểu SOA hoặc microservice; thay vào đó, các miền nghiệp vụ được chia mô-đun ngay trong cùng ứng dụng.

## 2. Mẫu kiến trúc được chọn

Mẫu kiến trúc chủ đạo là **N-layered architecture** triển khai bên trong modular monolith.

| Lớp logic | Trách nhiệm chính | Minh chứng mã nguồn |
|---|---|---|
| Presentation | Render giao diện, điều hướng, nhận thao tác người dùng | [app/(main)](../../app/(main)), [app/vendor](../../app/vendor), [app/admin](../../app/admin), [components](../../components) |
| Interface/API | Nhận request, kiểm tra phiên, kiểm soát truy cập, chuẩn hóa phản hồi | [app/api](../../app/api), [middleware.ts](../../middleware.ts), [lib/api/responses.ts](../../lib/api/responses.ts) |
| Business/Application | Thực thi use case, quy tắc nghiệp vụ, validation và orchestration | [lib/db](../../lib/db), [lib/api](../../lib/api), [lib/validations.ts](../../lib/validations.ts), [lib/variant-utils.ts](../../lib/variant-utils.ts) |
| Data/Infrastructure | ORM, schema dữ liệu, tích hợp dịch vụ ngoài | [lib/prisma.ts](../../lib/prisma.ts), [prisma/schema.prisma](../../prisma/schema.prisma), [lib/cloudinary.ts](../../lib/cloudinary.ts), [lib/vietqr.ts](../../lib/vietqr.ts), [lib/resend.ts](../../lib/resend.ts) |

### Luồng điển hình giữa các lớp

Luồng đặt hàng trong [app/api/orders/route.ts](../../app/api/orders/route.ts) thể hiện rõ các lớp:
1. API layer nhận request và áp dụng rate limit.
2. Validation kiểm tra payload qua `orderSchema`.
3. Business logic điều phối tạo user, tạo địa chỉ, kiểm tra tồn kho, tạo đơn.
4. Data layer dùng Prisma transaction để ghi dữ liệu nguyên tử.

### Vì sao không chọn mẫu khác làm mẫu chính

- **MVC**: có xuất hiện cục bộ ở mức route/page/component, nhưng toàn hệ thống không tổ chức theo controller-model-view một cách chặt chẽ.
- **CQRS**: có tách tương đối giữa luồng đọc và ghi qua các module query/helper, nhưng chưa tách read model, write model, bus hoặc datastore riêng.
- **Clean Architecture + Dependency Injection**: có một vài điểm đảo ngược phụ thuộc cục bộ, nhưng chưa có DI container hay vòng phụ thuộc được kiểm soát theo đúng mô hình clean architecture nghiêm ngặt.

Kết luận: mô tả chính xác nhất cho Fluxify ở thời điểm hiện tại là **Monolith + N-layered**.

## 3. Mẫu thiết kế đang dùng trong mã nguồn

### 3.1. Nhóm tạo dựng (Creational)

| Mẫu | Mục đích | Minh chứng |
|---|---|---|
| Singleton | Dùng một thể hiện chia sẻ để tránh tạo client lặp lại | [lib/prisma.ts](../../lib/prisma.ts) dùng `globalThis.prisma`; [lib/resend.ts](../../lib/resend.ts) lazy-init một instance `Resend` |
| Factory Method / Simple Factory | Tạo đúng implementation tùy môi trường chạy | `getRateLimitStore()` trong [lib/api/rate-limit.ts](../../lib/api/rate-limit.ts) chọn `InMemoryRateLimitStore` hoặc `RedisRateLimitStore` theo `REDIS_URL` |

### 3.2. Nhóm cấu trúc (Structural)

| Mẫu | Mục đích | Minh chứng |
|---|---|---|
| Facade | Bao bọc API ngoài bằng interface đơn giản hơn cho phần còn lại của hệ thống | [lib/cloudinary.ts](../../lib/cloudinary.ts) cung cấp `uploadToCloudinary()` và `deleteFromCloudinary()`; [lib/vietqr.ts](../../lib/vietqr.ts) cung cấp `generateVietQRUrl()` và `fetchVietQRBanks()` |

### 3.3. Nhóm hành vi (Behavioral)

| Mẫu | Mục đích | Minh chứng |
|---|---|---|
| Strategy | Hoán đổi thuật toán/lưu trữ rate limit tại runtime mà không đổi luồng xử lý bên trên | `RateLimitStore` cùng hai chiến lược `InMemoryRateLimitStore` và `RedisRateLimitStore` trong [lib/api/rate-limit.ts](../../lib/api/rate-limit.ts) |

## 4. Liên kết tới các sơ đồ liên quan

- [Use Case Diagram](../../charts/uml/uml-00-system-usecase-diagram.puml)
- [Class Diagram](../../charts/uml/uml-01-domain-class-model.puml)
- [Activity Diagram - Vòng đời sản phẩm](../../charts/uml/uml-06-product-lifecycle-activity.puml)
- [Activity Diagram - Vòng đời mẫu cửa hàng](../../charts/uml/uml-08-shop-template-lifecycle-activity.puml)
- [C4 Level 1 - Ngữ cảnh hệ thống](../../charts/c4/c4-01-system-context.puml)
- [C4 Level 2 - Container](../../charts/c4/c4-02-container-view.puml)

## 5. Kết luận ngắn gọn để trình bày

Khi bảo vệ, có thể chốt ngắn như sau:
- Fluxify là **modular monolith**.
- Mẫu kiến trúc chính là **N-layered architecture**.
- Design pattern tiêu biểu gồm:
  - **Creational**: Singleton, Factory Method
  - **Structural**: Facade
  - **Behavioral**: Strategy
