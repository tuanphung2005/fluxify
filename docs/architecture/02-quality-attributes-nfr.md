# 02. NFR và Kịch bản Thuộc tính Chất lượng

Tài liệu này định nghĩa các yêu cầu phi chức năng theo hướng đo lường được.

## 1. Bảng NFR tổng hợp

| ID | Thuộc tính | Mục tiêu | Bằng chứng hiện có | Trạng thái |
|---|---|---|---|---|
| NFR-01 | Tính sẵn sàng | >= 99.5%/tháng (mục tiêu môi trường thực tế) | Triển khai bằng Docker + CI lint/test/build | Đã đáp ứng một phần |
| NFR-02 | Hiệu năng API | p95 đọc < 500ms, p95 ghi < 1200ms ở tải phù hợp môn học | Lớp truy vấn tách riêng + phân trang tại route | Cần benchmark |
| NFR-03 | Bảo mật xác thực/phân quyền | 100% route nhạy cảm có kiểm tra vai trò | NextAuth + middleware kiểm soát vai trò | Đã đáp ứng ở mức ứng dụng |
| NFR-04 | Chống lạm dụng | Endpoint xác thực/ghi dữ liệu phải có giới hạn tần suất | Preset rate-limit + phản hồi 429 | Đã đáp ứng |
| NFR-05 | Toàn vẹn đầu vào | 100% đầu vào nhạy cảm qua kiểm tra/làm sạch dữ liệu | zod + sanitize-html + DOMPurify | Đã đáp ứng |
| NFR-06 | Nhất quán dữ liệu | Cập nhật đơn hàng và tồn kho theo giao dịch nguyên tử | Luồng xử lý đơn + kiểm thử tồn kho | Đã đáp ứng |
| NFR-07 | Khả năng bảo trì | Build xanh + test xanh trên pull request | Quy trình CI GitHub Actions | Đã đáp ứng |
| NFR-08 | Khả năng quan sát | Có nhật ký kiểm toán tập trung và chỉ số ứng dụng | Hiện mới có audit in-memory cho dev | Còn thiếu |

## 2. Kịch bản chất lượng

### Kịch bản Q1 - Đăng nhập và phân quyền
- Nguồn kích thích: Người dùng truy cập khu vực vai trò cao.
- Kích thích: Truy cập /admin hoặc /vendor khi vai trò không hợp lệ.
- Môi trường: Ứng dụng web ở môi trường thực tế.
- Phản hồi mong đợi: Hệ thống chuyển hướng về trang hợp lệ, không lộ dữ liệu.
- Thước đo: 100% request sai vai trò bị chặn.

### Kịch bản Q2 - Chống spam endpoint ghi
- Nguồn kích thích: Client hoặc bot gửi nhiều request liên tiếp.
- Kích thích: Vượt ngưỡng request/window.
- Môi trường: Hệ thống đang hoạt động bình thường.
- Phản hồi mong đợi: Trả 429 + Retry-After.
- Thước đo: Request vượt ngưỡng không vào logic nghiệp vụ.

### Kịch bản Q3 - Toàn vẹn đơn hàng
- Nguồn kích thích: Khách hàng đặt đơn với nhiều dòng sản phẩm.
- Kích thích: Có mặt hàng không đủ tồn kho.
- Môi trường: Giai đoạn tạo đơn và cập nhật tồn kho.
- Phản hồi mong đợi: Từ chối giao dịch hoặc hoàn tác (rollback) logic tạo đơn.
- Thước đo: Không có đơn thành công nào làm tồn kho âm.

### Kịch bản Q4 - Nội dung chat an toàn
- Nguồn kích thích: Người dùng gửi nội dung có HTML/script.
- Kích thích: POST message chứa payload độc hại.
- Môi trường: API chat đang xử lý yêu cầu ghi.
- Phản hồi mong đợi: Nội dung được làm sạch trước khi lưu/trả về.
- Thước đo: Không còn script tag hợp lệ sau bước làm sạch.

## 3. Kế hoạch đo lường

1. Hiệu năng: bổ sung benchmark k6/Artillery cho các route chính.
2. Tính sẵn sàng: bổ sung health check + theo dõi uptime (UptimeRobot/Grafana Cloud).
3. Khả năng quan sát: bổ sung audit bền vững và truy vết request.
4. Bảo mật: bổ sung SAST/dependency scan vào CI.
