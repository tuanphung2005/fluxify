# 03. Góc nhìn Triển khai và Vận hành

## 1. Môi trường vận hành

### Môi trường phát triển
- Chạy cục bộ bằng Bun/Node.
- DB PostgreSQL cục bộ hoặc môi trường đám mây cho dev.
- Redis là tùy chọn (nếu có REDIS_URL).

### Tích hợp liên tục (CI)
- Quy trình tại [.github/workflows/ci.yml](../../.github/workflows/ci.yml).
- Các bước chính: cài gói -> sinh Prisma client -> lint -> test -> build.

### Môi trường chạy container
- Dùng Docker build nhiều giai đoạn trong [Dockerfile](../../Dockerfile).
- Giai đoạn phụ thuộc: cài dependencies + prisma generate.
- Giai đoạn biên dịch: build Next.js.
- Giai đoạn chạy: chạy production trên cổng 7860.

## 2. Kiến trúc triển khai tối thiểu

1. Một container ứng dụng (Next.js nguyên khối mô-đun).
2. Một PostgreSQL instance.
3. Redis tùy chọn cho giới hạn tần suất theo nhiều instance.
4. Dịch vụ quản lý bên ngoài: Cloudinary, Resend, VietQR.

## 3. Biến môi trường quan trọng

- DATABASE_URL: bắt buộc.
- NEXTAUTH_SECRET, NEXTAUTH_URL: phiên xác thực.
- RESEND_API_KEY, RESEND_FROM_EMAIL: dịch vụ gửi email.
- CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET: dịch vụ media.
- REDIS_URL: nên có nếu triển khai nhiều instance và cần đồng bộ rate limit.

## 4. Các lưu ý triển khai

- Ứng dụng là stateless; trạng thái nghiệp vụ nằm ở PostgreSQL.
- Khi mở rộng theo chiều ngang, nên ưu tiên Redis làm nơi lưu rate-limit.
- Secrets cần quản lý qua secret manager (GitHub Secrets/Cloud Secret Store).
- Cần bổ sung chiến lược migration cho production (blue-green hoặc rolling có chốt migrate).

## 5. Vận hành và giám sát

Hiện trạng:
- Có chốt chất lượng lint/test/build trong CI.
- Chưa có bộ theo dõi chỉ số, truy vết và gom log tập trung đầy đủ.

Khuyến nghị tối thiểu để đạt mức sẵn sàng triển khai trong bối cảnh môn học:
1. Tạo endpoint /health và cấu hình kiểm tra định kỳ.
2. Đẩy log tập trung (JSON logs) vào một hệ thống quan sát.
3. Theo dõi p95 độ trễ và tỷ lệ lỗi theo endpoint.
4. Cảnh báo cho tỷ lệ lỗi 5xx và lỗi kết nối cơ sở dữ liệu.
