# ADR-001: Chọn kiến trúc nguyên khối mô-đun với Next.js

- Trạng thái: Đã chấp thuận
- Ngày: 2026-04-13

## Bối cảnh

Dự án cần giao nhanh, gồm nhiều miền nghiệp vụ (xác thực, đơn hàng, chat, người bán, quản trị) nhưng nhóm phát triển nhỏ.
Cần kiến trúc dễ bảo trì trong phạm vi môn học, đồng thời không tạo gánh nặng vận hành quá sớm.

## Quyết định

Sử dụng Next.js App Router theo mô hình nguyên khối mô-đun:
- Giao diện trong app/*
- API routes trong app/api/*
- Truy cập dữ liệu và logic miền trong lib/db/* và lib/api/*
- Xác thực tập trung trong lib/auth.ts + middleware.ts

## Hệ quả

### Điểm tích cực
- Tốc độ phát triển và phát hành cao.
- Quy trình build/deploy đơn giản.
- Dễ truy vết toàn bộ luồng từ UI -> API -> DB trong một codebase.

### Điểm hạn chế
- Khó mở rộng độc lập theo từng miền nghiệp vụ.
- Khi mã nguồn tăng nhanh, cần quy ước ranh giới mô-đun rõ để tránh phụ thuộc chéo.

## Các phương án đã cân nhắc

1. Dùng vi dịch vụ ngay từ đầu: bị loại do độ phức tạp vận hành cao.
2. Tách backend riêng + frontend riêng: bị loại trong giai đoạn hiện tại để tối ưu nguồn lực.
