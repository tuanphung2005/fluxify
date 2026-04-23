# 08. Minh chứng Phần mềm: Demo và Mã nguồn

Tài liệu này gom phần minh chứng phần mềm theo đúng rubric của môn học: có thể dùng trực tiếp khi quay demo, bảo vệ hoặc nộp kèm mã nguồn.

## 1. Mục tiêu minh chứng

- Chứng minh sản phẩm Fluxify đã hiện thực các use case cốt lõi.
- Chỉ ra vị trí mã nguồn tương ứng với từng phân hệ chính.
- Cung cấp lệnh chạy và kiểm chứng để giảng viên/nhóm dễ tái hiện.

## 2. Kịch bản demo đề xuất

| Bước | Kịch bản | Vai trò | Thành phần trình bày | Kết quả mong đợi |
|---|---|---|---|---|
| 1 | Đăng nhập theo vai trò và truy cập dashboard | Vendor, Admin, Customer | `app/(main)/*`, `app/vendor/*`, `app/admin/*`, `middleware.ts` | Hệ thống điều hướng đúng khu vực và chặn sai quyền |
| 2 | Người bán tạo/cập nhật sản phẩm và cấu hình VietQR | Vendor | `app/vendor/products/page.tsx`, `app/vendor/payment/page.tsx`, `app/api/products/*`, `app/api/vendor/payment/route.ts` | Sản phẩm được lưu, QR preview sinh thành công |
| 3 | Khách hàng duyệt shop, thêm giỏ hàng và checkout | Customer | `app/(main)/shop/[vendorId]/page.tsx`, `components/shop/CartDrawer.tsx`, `components/shop/CheckoutModal.tsx`, `app/api/orders/route.ts` | Đơn hàng được tạo, tồn kho cập nhật, hiển thị thông tin thanh toán |
| 4 | Người bán xem và cập nhật trạng thái đơn | Vendor | `app/vendor/orders/page.tsx`, `components/vendor/VendorOrdersPage.tsx`, `app/api/vendor/orders/route.ts` | Đơn chuyển trạng thái hợp lệ theo vòng đời |
| 5 | Chat khách hàng-người bán với nội dung được làm sạch | Customer, Vendor | `components/shop/ChatModal.tsx`, `components/vendor/VendorChatPage.tsx`, `app/api/chat/*` | Tin nhắn được lưu/hiển thị, payload HTML độc hại bị sanitize |
| 6 | Quản trị viên khóa/mở tài khoản người dùng | Admin | `app/admin/users/page.tsx`, `app/api/admin/users/*`, `middleware.ts` | User bị vô hiệu hóa sẽ không truy cập được vùng hạn chế |

## 3. Liên kết với sơ đồ và use case

| Kịch bản demo | Use case / sơ đồ liên quan |
|---|---|
| Đăng nhập và phân quyền | [uml-05](../../charts/uml/uml-05-auth-registration-sequence.puml), [07-use-case-specifications.md](07-use-case-specifications.md) |
| Checkout và tồn kho | [uml-03](../../charts/uml/uml-03-checkout-sequence.puml), [uml-07](../../charts/uml/uml-07-order-state-machine.puml), [uml-09](../../charts/uml/uml-09-checkout-activity.puml) |
| Vận hành người bán | [uml-04](../../charts/uml/uml-04-vendor-operations-sequence.puml), [uml-06](../../charts/uml/uml-06-product-lifecycle-activity.puml) |
| Shop Builder | [uml-08](../../charts/uml/uml-08-shop-template-lifecycle-activity.puml), [c4-04](../../charts/c4/c4-04-shop-builder-components.puml) |
| Chat | [c4-05](../../charts/c4/c4-05-chat-components.puml) |
| Quản trị hệ thống | [c4-06](../../charts/c4/c4-06-vendor-admin-components.puml) |

## 4. Bản đồ mã nguồn để minh chứng

| Khu vực | Đường dẫn chính | Vai trò trong demo |
|---|---|---|
| Giao diện storefront | [app/(main)](../../app/(main)) | Trình bày luồng khách truy cập và khách hàng |
| Giao diện người bán | [app/vendor](../../app/vendor), [components/vendor](../../components/vendor) | Trình bày quản lý sản phẩm, đơn hàng, analytics, thanh toán, chat |
| Giao diện quản trị | [app/admin](../../app/admin), [components/admin](../../components/admin) | Trình bày quản trị người dùng, cửa hàng, danh mục |
| API nghiệp vụ | [app/api](../../app/api) | Chứng minh xử lý request, phân quyền, mutation |
| Logic truy vấn/nghiệp vụ | [lib/db](../../lib/db), [lib/api](../../lib/api), [lib/validations.ts](../../lib/validations.ts) | Chứng minh lớp business và data |
| Dữ liệu và ORM | [prisma/schema.prisma](../../prisma/schema.prisma), [lib/prisma.ts](../../lib/prisma.ts), [prisma/migrations](../../prisma/migrations) | Chứng minh mô hình dữ liệu và migration |
| Kiểm thử | [tests](../../tests) | Minh chứng chất lượng và regression coverage |
| Tài liệu sơ đồ | [charts](../../charts), [docs/architecture](.) | Minh chứng phân tích và thiết kế |

## 5. Lệnh chạy và kiểm chứng cục bộ

### Chạy ứng dụng

```powershell
bun install
bunx prisma generate
bunx prisma migrate dev
npx tsx prisma/seed.ts
bun run dev
```

### Kiểm chứng trước khi demo hoặc nộp

```powershell
bun run lint
bun run test
bun run build
Get-ChildItem charts -Recurse -Filter *.puml | ForEach-Object { plantuml -checkonly $_.FullName }
```

## 6. Bằng chứng chất lượng hiện có

- CI thực hiện `lint`, `test`, `build` tại [.github/workflows/ci.yml](../../.github/workflows/ci.yml).
- Các bài test về phiên đăng nhập, tồn kho, chat, upload, review và rate limit nằm trong [tests](../../tests).
- Ma trận truy vết yêu cầu và bằng chứng kiểm chứng nằm trong [05-traceability-and-validation.md](05-traceability-and-validation.md).

## 7. Thư mục lưu ảnh/video minh chứng

Nếu cần nộp kèm ảnh chụp màn hình hoặc link video demo, lưu theo hướng dẫn tại [evidence/README.md](evidence/README.md).
