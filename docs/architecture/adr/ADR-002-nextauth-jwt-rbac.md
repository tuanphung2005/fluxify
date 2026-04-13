# ADR-002: Chọn NextAuth JWT kết hợp phân quyền theo vai trò

- Trạng thái: Đã chấp thuận
- Ngày: 2026-04-13

## Bối cảnh

Hệ thống có nhiều vai trò (CUSTOMER, VENDOR, ADMIN) và cần bảo vệ tuyến theo vai trò.
Cần giải pháp xác thực tích hợp tốt với Next.js và dễ bảo trì trong bối cảnh môn học.

## Quyết định

Sử dụng NextAuth với Credentials provider, chiến lược phiên JWT và middleware phân quyền theo vai trò:
- Cấu hình xác thực: [lib/auth.ts](../../../lib/auth.ts)
- Chặn tuyến theo vai trò: [middleware.ts](../../../middleware.ts)

## Hệ quả

### Điểm tích cực
- Tích hợp chặt với hệ sinh thái Next.js.
- Đơn giản hóa kiểm tra vai trò tại middleware.
- Payload phiên mang role và isActive để xử lý nhanh.

### Điểm hạn chế
- Cần quản lý vòng đời token cẩn thận khi mở rộng quy mô lớn.
- Một số API route vẫn cần kiểm tra vai trò bổ sung ở phía máy chủ.

## Các phương án đã cân nhắc

1. Chỉ dùng OAuth: không phù hợp vì hệ thống cần đăng nhập tài khoản/mật khẩu.
2. Lưu phiên theo chiến lược cơ sở dữ liệu: tạm hoãn để ưu tiên đơn giản và hiệu năng.
