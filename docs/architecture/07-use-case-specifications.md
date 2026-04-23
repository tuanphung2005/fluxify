# 07. Bảng Use Case và Đặc tả Rút gọn

Tài liệu này bổ sung phần sơ đồ Use Case bằng các bảng use case chia theo actor để dễ đọc, dễ đối chiếu với mã nguồn và phù hợp hơn với cách chấm bài theo checklist.

## 1. Liên kết nhanh

- [Use Case Diagram tổng thể](../../charts/uml/uml-00-system-usecase-diagram.puml)
- [Activity Diagram - Checkout](../../charts/uml/uml-09-checkout-activity.puml)
- [Activity Diagram - Vòng đời sản phẩm](../../charts/uml/uml-06-product-lifecycle-activity.puml)
- [Activity Diagram - Vòng đời mẫu cửa hàng](../../charts/uml/uml-08-shop-template-lifecycle-activity.puml)

## 2. Bảng Use Case theo actor

### 2.1. Khách truy cập

| ID | Use case | Mục tiêu | Tiền điều kiện | Kết quả chính | Tham chiếu |
|---|---|---|---|---|---|
| GUEST-01 | Đăng ký tài khoản | Tạo tài khoản khách hàng hoặc người bán | Chưa có tài khoản | Tài khoản mới được tạo và chờ xác minh email | `app/api/auth/register/route.ts`, `uml-05` |
| GUEST-02 | Gửi lại email xác minh | Nhận lại email xác minh khi token cũ hết hạn/chưa nhận được | Email đã đăng ký nhưng chưa xác minh | Email xác minh mới được gửi | `app/api/auth/verify/route.ts`, `uml-05` |
| GUEST-03 | Xác minh email | Kích hoạt tài khoản sau đăng ký | Có token xác minh hợp lệ | `emailVerified = true` | `app/api/auth/verify/route.ts`, `uml-05` |
| GUEST-04 | Đăng nhập | Tạo phiên đăng nhập theo vai trò | Có tài khoản hợp lệ | Người dùng nhận được phiên JWT | `app/api/auth/[...nextauth]/route.ts`, `uml-05` |
| GUEST-05 | Yêu cầu đặt lại mật khẩu | Nhận email đặt lại mật khẩu | Có email hợp lệ | Link/token đặt lại mật khẩu được gửi | `app/api/user/password/route.ts` |
| GUEST-06 | Đặt lại mật khẩu | Thiết lập mật khẩu mới | Có token đặt lại hợp lệ | Mật khẩu được cập nhật | `app/api/user/password/route.ts` |
| GUEST-07 | Khám phá cửa hàng và sản phẩm | Duyệt danh mục cửa hàng/sản phẩm | Không | Dữ liệu public được hiển thị | `app/(main)/shop/*`, `app/api/products/*` |
| GUEST-08 | Xem chi tiết sản phẩm | Xem thông tin chi tiết một sản phẩm | Sản phẩm tồn tại | Thông tin sản phẩm và review được hiển thị | `app/(main)/shop/[vendorId]/product/[productId]/page.tsx` |
| GUEST-09 | Xem thống kê cửa hàng | Xem điểm đánh giá và thống kê cơ bản của shop | Shop tồn tại | Số liệu public của cửa hàng được hiển thị | `app/api/shop/[vendorId]/stats/route.ts` |
| GUEST-10 | Xem đánh giá sản phẩm | Xem review của một sản phẩm | Sản phẩm tồn tại | Danh sách review và summary được trả về | `app/api/products/[id]/reviews/route.ts` |
| GUEST-11 | Xem đánh giá cửa hàng | Xem review ở cấp cửa hàng | Shop tồn tại | Danh sách review và phân bố rating được hiển thị | `app/api/shop/[vendorId]/reviews/route.ts` |

### 2.2. Khách hàng

| ID | Use case | Mục tiêu | Tiền điều kiện | Kết quả chính | Tham chiếu |
|---|---|---|---|---|---|
| CUS-01 | Xem dashboard cá nhân | Xem hồ sơ, thống kê, đơn hàng, cửa hàng yêu thích | Đã đăng nhập | Dữ liệu cá nhân được tổng hợp | `app/api/user/personal/route.ts`, `app/orders/page.tsx` |
| CUS-02 | Quản lý giỏ hàng | Thêm/xóa/cập nhật số lượng sản phẩm cần mua | Có sản phẩm hợp lệ | Giỏ hàng được cập nhật | `store/cart-store.ts`, `components/shop/CartDrawer.tsx` |
| CUS-03 | Quản lý wishlist sản phẩm | Lưu hoặc bỏ lưu sản phẩm quan tâm | Đã đăng nhập | Trạng thái wishlist thay đổi | `app/api/wishlist/route.ts` |
| CUS-04 | Yêu thích cửa hàng | Lưu hoặc bỏ lưu một cửa hàng | Đã đăng nhập | Danh sách favorite shops được cập nhật | `app/api/user/personal/favorite-shops/route.ts` |
| CUS-05 | Áp dụng mã giảm giá | Kiểm tra coupon hợp lệ trước checkout | Có mã coupon và giỏ hàng hợp lệ | Mức giảm giá được tính | `app/api/coupons/validate/route.ts` |
| CUS-06 | Đặt hàng | Tạo đơn hàng và cập nhật tồn kho | Email đã xác thực, dữ liệu mua hàng hợp lệ | Đơn hàng được tạo, tồn kho được trừ | `app/api/orders/route.ts`, `uml-03`, `uml-09` |
| CUS-07 | Xem QR/thông tin thanh toán | Lấy thông tin ngân hàng người bán để chuyển khoản | Shop có cấu hình thanh toán | QR VietQR và thông tin chuyển khoản hiển thị | `app/api/shop/[vendorId]/payment/route.ts`, `components/shop/CheckoutModal.tsx` |
| CUS-08 | Xem đơn hàng cá nhân | Theo dõi danh sách đơn và trạng thái | Đã đăng nhập | Danh sách đơn hàng được trả về | `app/api/user/orders/route.ts` |
| CUS-09 | Hủy đơn hàng | Hủy đơn khi đơn chưa hoàn tất | Đã đăng nhập và là chủ đơn | Đơn chuyển `CANCELLED`, tồn kho được hoàn lại | `app/api/user/orders/route.ts`, `uml-07` |
| CUS-10 | Gửi/Nhận biên nhận đơn hàng | Nhận email xác nhận sau khi thanh toán | Đơn hàng đã được tạo | Email biên nhận được gửi | `app/api/orders/[orderId]/receipt/route.ts` |
| CUS-11 | Trò chuyện với người bán | Tạo cuộc trò chuyện, gửi/đọc tin nhắn | Đã đăng nhập | Hội thoại và tin nhắn được cập nhật | `app/api/chat/*`, `c4-05` |
| CUS-12 | Xem tin nhắn chưa đọc | Biết số tin nhắn mới từ người bán | Đã đăng nhập | Tổng số tin nhắn chưa đọc được trả về | `app/api/chat/unread/route.ts` |
| CUS-13 | Viết đánh giá sản phẩm | Đánh giá sản phẩm đã mua | Đã đăng nhập | Review mới được lưu | `app/api/products/[id]/reviews/route.ts` |

### 2.3. Người bán

| ID | Use case | Mục tiêu | Tiền điều kiện | Kết quả chính | Tham chiếu |
|---|---|---|---|---|---|
| VEN-01 | Xem dashboard người bán | Truy cập khu vực vận hành của shop | Đã đăng nhập vai trò `VENDOR` | Dashboard vendor hiển thị | `app/vendor/page.tsx`, `middleware.ts` |
| VEN-02 | Cập nhật hồ sơ cửa hàng | Sửa tên cửa hàng, mô tả, favicon | Đã đăng nhập vai trò `VENDOR` | Hồ sơ shop được cập nhật | `app/api/vendor/profile/route.ts` |
| VEN-03 | Quản lý sản phẩm | Tạo/sửa/xóa/khôi phục sản phẩm và biến thể | Đã đăng nhập vai trò `VENDOR` | Dữ liệu sản phẩm thay đổi | `app/api/products/*`, `uml-06` |
| VEN-04 | Tải media sản phẩm | Tải ảnh lên Cloudinary | Đã đăng nhập vai trò `VENDOR` | URL media được lưu | `app/api/upload/route.ts` |
| VEN-05 | Quản lý coupon | Tạo, xem, xóa mã giảm giá | Đã đăng nhập vai trò `VENDOR` | Coupon của shop được cập nhật | `app/api/vendor/coupons/route.ts` |
| VEN-06 | Quản lý đơn hàng cửa hàng | Xem đơn và cập nhật trạng thái | Đã đăng nhập vai trò `VENDOR` | Trạng thái đơn thay đổi, có audit log | `app/api/vendor/orders/route.ts`, `uml-07` |
| VEN-07 | Quản lý thanh toán VietQR | Cấu hình tài khoản nhận tiền và xem QR preview | Đã đăng nhập vai trò `VENDOR` | Thông tin thanh toán được lưu | `app/api/vendor/payment/route.ts`, `app/vendor/payment/page.tsx` |
| VEN-08 | Xem phân tích kinh doanh | Theo dõi doanh thu, đơn hàng, chuyển đổi | Đã đăng nhập vai trò `VENDOR` | Dữ liệu analytics được trả về | `app/api/vendor/analytics/route.ts` |
| VEN-09 | Trò chuyện với khách hàng | Xem và phản hồi các cuộc trò chuyện | Đã đăng nhập vai trò `VENDOR` | Tin nhắn và unread count được cập nhật | `app/api/chat/*`, `app/vendor/chat/page.tsx` |
| VEN-10 | Quản lý Shop Builder | Tạo, chỉnh sửa, đồng bộ, xuất bản/ẩn cửa hàng | Đã đăng nhập vai trò `VENDOR` | Template và components được cập nhật | `app/api/shop/*`, `uml-08` |

### 2.4. Quản trị viên

| ID | Use case | Mục tiêu | Tiền điều kiện | Kết quả chính | Tham chiếu |
|---|---|---|---|---|---|
| ADM-01 | Xem dashboard quản trị | Truy cập khu vực quản trị hệ thống | Đã đăng nhập vai trò `ADMIN` | Dashboard admin hiển thị | `app/admin/page.tsx`, `middleware.ts` |
| ADM-02 | Quản lý người dùng | Xem danh sách user và khóa/mở tài khoản | Đã đăng nhập vai trò `ADMIN` | `isActive` của user thay đổi | `app/api/admin/users/route.ts`, `app/api/admin/users/[id]/status/route.ts` |
| ADM-03 | Quản lý cửa hàng | Xem danh sách các shop trên hệ thống | Đã đăng nhập vai trò `ADMIN` | Dữ liệu shop được tổng hợp | `app/api/admin/shops/route.ts` |
| ADM-04 | Quản lý danh mục | Tạo, sửa, xóa danh mục sản phẩm | Đã đăng nhập vai trò `ADMIN` | Danh mục được cập nhật | `app/api/categories/route.ts`, `app/api/categories/[id]/route.ts` |
| ADM-05 | Xóa vĩnh viễn sản phẩm vi phạm | Loại bỏ sản phẩm khỏi hệ thống | Đã đăng nhập vai trò `ADMIN` | Sản phẩm bị xóa cứng | `app/api/admin/products/[id]/route.ts` |

## 3. Đặc tả rút gọn cho use case trọng tâm

### UC-CUS-06. Đặt hàng

| Mục | Nội dung |
|---|---|
| Actor chính | Khách hàng |
| Mục tiêu | Tạo đơn hàng mới và giữ tính toàn vẹn tồn kho |
| Tiền điều kiện | Email đã xác thực, giỏ hàng không rỗng, shop có cấu hình thanh toán |
| Kích hoạt | Người dùng nhấn nút thanh toán trong `CheckoutModal` |
| Luồng chính | 1. Nhập thông tin người mua và địa chỉ. 2. Hệ thống kiểm tra dữ liệu. 3. API tạo đơn hàng trong transaction. 4. Hệ thống kiểm tra tồn kho. 5. Tạo đơn và trừ tồn kho. 6. Hiển thị QR VietQR. 7. Gửi biên nhận sau khi xác nhận thanh toán. |
| Ngoại lệ | Dữ liệu không hợp lệ, email chưa xác thực, hết hàng, rate limit |
| Hậu điều kiện | Đơn hàng được tạo thành công hoặc bị rollback hoàn toàn |
| Sơ đồ liên quan | `uml-03`, `uml-07`, `uml-09` |

### UC-VEN-03. Quản lý sản phẩm

| Mục | Nội dung |
|---|---|
| Actor chính | Người bán |
| Mục tiêu | Tạo, cập nhật, xóa mềm và khôi phục sản phẩm |
| Tiền điều kiện | Đăng nhập vai trò `VENDOR` |
| Kích hoạt | Người bán thao tác ở trang quản lý sản phẩm |
| Luồng chính | 1. Mở form sản phẩm. 2. Nhập dữ liệu cơ bản, biến thể, ảnh. 3. Tải media nếu cần. 4. Hệ thống kiểm tra quyền và validation. 5. Lưu dữ liệu sản phẩm. |
| Ngoại lệ | Sai quyền, dữ liệu biến thể không hợp lệ, upload lỗi |
| Hậu điều kiện | Sản phẩm được tạo/cập nhật hoặc trả lỗi có cấu trúc |
| Sơ đồ liên quan | `uml-06`, `uml-04` |

### UC-VEN-10. Quản lý Shop Builder

| Mục | Nội dung |
|---|---|
| Actor chính | Người bán |
| Mục tiêu | Thiết kế và xuất bản giao diện cửa hàng |
| Tiền điều kiện | Đăng nhập vai trò `VENDOR`, email đã xác thực |
| Kích hoạt | Người bán mở `app/vendor/shop-builder/page.tsx` |
| Luồng chính | 1. Tải hoặc tạo template. 2. Thêm/sửa/xóa component. 3. Sắp xếp lại bố cục. 4. Đồng bộ component với server. 5. Xem trước giao diện. 6. Xuất bản hoặc ẩn cửa hàng. |
| Ngoại lệ | Chưa xác thực email, đồng bộ component lỗi, template không thuộc quyền sở hữu |
| Hậu điều kiện | Bản nháp hoặc snapshot đã xuất bản được cập nhật |
| Sơ đồ liên quan | `uml-08`, `c4-04` |

### UC-ADM-02. Quản lý người dùng

| Mục | Nội dung |
|---|---|
| Actor chính | Quản trị viên |
| Mục tiêu | Xem danh sách user và khóa/mở quyền truy cập |
| Tiền điều kiện | Đăng nhập vai trò `ADMIN` |
| Kích hoạt | Quản trị viên truy cập trang quản lý user |
| Luồng chính | 1. Hệ thống tải danh sách user. 2. Quản trị viên chọn một user. 3. Gửi cập nhật `isActive`. 4. Middleware chặn user bị vô hiệu hóa trong các lần truy cập tiếp theo. |
| Ngoại lệ | Không đủ quyền, user không tồn tại |
| Hậu điều kiện | Trạng thái user được cập nhật |
| Sơ đồ liên quan | `c4-06`, `middleware.ts` |

## 4. Activity Diagram hiện có

Hiện bộ hồ sơ đã có các activity diagram sau:

1. [Checkout Activity](../../charts/uml/uml-09-checkout-activity.puml)
2. [Vòng đời sản phẩm](../../charts/uml/uml-06-product-lifecycle-activity.puml)
3. [Vòng đời mẫu cửa hàng](../../charts/uml/uml-08-shop-template-lifecycle-activity.puml)

Kết luận: phần `Activity Diagram` hiện **đã có**, và đã bao phủ cả use case trọng tâm `checkout` lẫn hai luồng nghiệp vụ lớn phía người bán.
