# ADR-003: Chọn Prisma + PostgreSQL cho lớp dữ liệu

- Trạng thái: Đã chấp thuận
- Ngày: 2026-04-13

## Bối cảnh

Miền nghiệp vụ có nhiều quan hệ (người dùng, đơn hàng, sản phẩm, đánh giá, chat, danh sách yêu thích, thành phần mẫu cửa hàng)
và cần bảo đảm tính nhất quán giao dịch cho luồng tạo đơn.

## Quyết định

Sử dụng PostgreSQL làm hệ quản trị dữ liệu chính và Prisma làm lớp ORM/truy cập dữ liệu:
- Lược đồ và quan hệ: [prisma/schema.prisma](../../../prisma/schema.prisma)
- Khởi tạo Prisma client: [lib/prisma.ts](../../../lib/prisma.ts)

## Hệ quả

### Điểm tích cực
- Mô hình quan hệ mạnh, phù hợp miền thương mại điện tử.
- Prisma giúp mã truy cập dữ liệu rõ ràng, có kiểu dữ liệu an toàn.
- Hỗ trợ migration và sinh client tự động trong CI/build.

### Điểm hạn chế
- Chưa tối ưu cho phân tích dữ liệu khối lượng rất lớn.
- Cần quản lý migration chặt chẽ khi triển khai môi trường thực tế.

## Các phương án đã cân nhắc

1. Ưu tiên NoSQL: không phù hợp cho quan hệ phức tạp và giao dịch đơn hàng.
2. Chỉ dùng SQL thuần: tăng chi phí bảo trì và rủi ro sai sót.
