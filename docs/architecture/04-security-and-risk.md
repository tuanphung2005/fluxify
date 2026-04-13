# 04. Góc nhìn Bảo mật và Sổ đăng ký Rủi ro

## 1. Biện pháp bảo mật đã có trong mã nguồn

1. Xác thực và phiên
- Dùng NextAuth Credentials Provider và JWT session trong [lib/auth.ts](../../lib/auth.ts).
- So khớp mật khẩu bằng bcrypt.
- Kiểm tra tài khoản bị vô hiệu hóa và trạng thái xác minh email trước khi cấp phiên.

2. Phân quyền và bảo vệ tuyến
- Chặn truy cập theo vai trò trong [middleware.ts](../../middleware.ts) cho /admin và /vendor.
- Tái sử dụng helper xác thực tại nhiều API route theo miền.

3. Kiểm tra dữ liệu đầu vào
- Dùng zod tại [lib/validations.ts](../../lib/validations.ts) và nhiều route app/api/*.
- Trả lỗi có cấu trúc khi payload không hợp lệ.

4. Giới hạn tần suất
- Có module [lib/api/rate-limit.ts](../../lib/api/rate-limit.ts).
- Có preset theo nhóm endpoint (auth/write/admin).
- Trả 429 và Retry-After khi vượt ngưỡng.

5. Làm sạch nội dung
- Làm sạch nội dung chat bằng sanitize-html tại [app/api/chat/conversations/[id]/messages/route.ts](../../app/api/chat/conversations/[id]/messages/route.ts).
- Làm sạch rich text bằng DOMPurify tại [components/shop/components/TextBlock.tsx](../../components/shop/components/TextBlock.tsx).

6. Kiểm tra cấu hình bí mật và biến môi trường
- Kiểm tra biến Cloudinary tại [lib/cloudinary.ts](../../lib/cloudinary.ts).
- Kiểm tra biến Resend tại [lib/api/email-verification.ts](../../lib/api/email-verification.ts).

## 2. Mô hình đe dọa (rút gọn)

Tài sản cần bảo vệ:
- Tài khoản người dùng và token phiên.
- Dữ liệu đơn hàng, địa chỉ, thông tin thanh toán của người bán.
- Nội dung chat và dữ liệu media tải lên.

Điểm vào chính:
- Các API route app/api/*.
- Luồng xác thực và middleware.
- Điểm tích hợp với dịch vụ bên ngoài.

## 3. Bảng đăng ký rủi ro

| ID | Rủi ro | Mức độ | Hiện trạng | Hướng xử lý |
|---|---|---|---|---|
| R-01 | Rate limit in-memory không đồng bộ khi chạy nhiều instance | Trung bình | Có fallback Redis nhưng chưa bắt buộc | Bật REDIS_URL ở production |
| R-02 | Audit log chỉ lưu in-memory, không bền vững | Trung bình | Hữu ích cho dev, chưa đủ cho điều tra sự cố | Đưa audit vào DB hoặc hệ thống log tập trung |
| R-03 | Chưa có giám sát/cảnh báo bảo mật tập trung | Trung bình | CI có lint/test nhưng chưa có cảnh báo runtime | Thêm SIEM hoặc cảnh báo log theo ngưỡng |
| R-04 | Chưa có benchmark và SLO rõ cho endpoint trọng yếu | Trung bình | Có kiểm thử logic nhưng chưa có tải thực tế | Bổ sung load test + mục tiêu p95 |
| R-05 | Sai cấu hình secret khi triển khai thủ công | Cao | Có kiểm tra env một phần | Chuẩn hóa secret manager + startup validation |

## 4. Bằng chứng kiểm thử bảo mật

- Làm sạch nội dung chat: [tests/chat-sanitization.test.ts](../../tests/chat-sanitization.test.ts)
- Sửa lỗi bảo mật/hồi quy: [tests/security-fixes.test.ts](../../tests/security-fixes.test.ts)
- Kiểm tra biến môi trường: [tests/env-validation.test.ts](../../tests/env-validation.test.ts)
- Kiểm tra xác thực upload: [tests/upload-auth.test.ts](../../tests/upload-auth.test.ts)

## 5. Danh sách việc bảo mật nên làm tiếp

1. Thêm audit trail bền vững (bảng DB hoặc logger ngoài).
2. Thêm quét lỗ hổng dependency vào CI.
3. Bắt buộc backend lưu rate-limit cho production nhiều instance.
4. Viết runbook xử lý sự cố lộ tài khoản và gián đoạn dịch vụ.
