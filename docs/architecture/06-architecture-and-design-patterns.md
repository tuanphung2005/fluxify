# 06. Kiến trúc, Mẫu kiến trúc và Mẫu thiết kế

## Mục tiêu chương

Chương này giải thích theo cách dễ hiểu ba nội dung chính của Fluxify:
1. Hệ thống đang dùng loại kiến trúc nào.
2. Cách tổ chức các lớp chức năng trong kiến trúc đó.
3. Các mẫu thiết kế (design pattern) tiêu biểu theo ba nhóm: tạo dựng, cấu trúc, hành vi.

Nội dung được trình bày theo phong cách báo cáo: định nghĩa ngắn gọn, cách áp dụng trong dự án và lợi ích thực tế.

## 1. Kiến trúc hệ thống được chọn

Fluxify chọn **kiến trúc nguyên khối mô-đun (modular monolith)**.

Hiểu đơn giản:
1. Toàn bộ hệ thống chạy trong một ứng dụng duy nhất.
2. Bên trong ứng dụng, chức năng vẫn được chia thành nhiều mô-đun theo nghiệp vụ.
3. Các mô-đun chia sẻ cùng dữ liệu và cùng cơ chế xác thực.

### So sánh phương án kiến trúc

| Phương án | Mức phù hợp với đề tài | Giải thích ngắn gọn |
|---|---|---|
| Monolith mô-đun (được chọn) | Cao | Triển khai đơn giản, dễ theo dõi toàn bộ luồng xử lý từ giao diện đến dữ liệu |
| SOA | Trung bình | Có thể tách dịch vụ, nhưng tăng chi phí tích hợp và quản lý vận hành |
| Microservice | Thấp ở giai đoạn hiện tại | Mạnh về mở rộng lớn, nhưng phức tạp hơn nhu cầu của đồ án |

### Vì sao lựa chọn này hợp lý

1. Hệ thống có nhiều vai trò (khách hàng, vendor, admin) nhưng vẫn cần triển khai nhanh và ổn định.
2. Đội phát triển quy mô nhỏ, ưu tiên tốc độ hoàn thiện chức năng trước khi tối ưu hạ tầng phân tán.
3. Mô hình monolith mô-đun vẫn cho phép tách rõ nghiệp vụ mà không làm tăng độ phức tạp vận hành.

Kết luận: với phạm vi hiện tại, modular monolith là lựa chọn cân bằng tốt giữa **tốc độ phát triển**, **độ ổn định** và **chi phí vận hành**.

## 2. Mẫu kiến trúc được chọn

Fluxify tổ chức theo **N-layered architecture** bên trong monolith.

Hiểu đơn giản, hệ thống được chia theo tầng để mỗi tầng làm đúng một nhóm việc.

| Tầng | Chức năng chính | Người đọc có thể hình dung như sau |
|---|---|---|
| Presentation | Hiển thị giao diện và nhận thao tác | Trang cho khách hàng, vendor, admin và các thành phần UI |
| API/Interface | Nhận request và kiểm soát truy cập | Kiểm tra đăng nhập, vai trò, chuẩn hóa phản hồi |
| Business/Application | Xử lý quy tắc nghiệp vụ | Kiểm tra dữ liệu, điều phối các bước xử lý use case |
| Data/Infrastructure | Làm việc với dữ liệu và dịch vụ ngoài | Ghi đọc database, gửi email, upload ảnh, rate limit, QR thanh toán |

### Ví dụ luồng điển hình: tạo đơn hàng

1. Người dùng gửi yêu cầu đặt hàng từ giao diện.
2. API nhận yêu cầu, kiểm tra điều kiện truy cập và giới hạn tần suất.
3. Tầng nghiệp vụ kiểm tra dữ liệu đầu vào và tồn kho.
4. Tầng dữ liệu ghi các thay đổi trong transaction để đảm bảo nhất quán.
5. API trả kết quả theo một định dạng thống nhất để giao diện xử lý.

Ý nghĩa của N-layered: mỗi tầng rõ trách nhiệm, nên hệ thống dễ bảo trì và dễ mở rộng chức năng mới.

## 3. Mẫu thiết kế theo 3 nhóm chính

Phần này tập trung vào câu hỏi: Fluxify dùng pattern nào và pattern đó giải quyết vấn đề gì trong thực tế.

### 3.1. Nhóm tạo dựng (Creational)

Nhóm này trả lời: tạo đối tượng thế nào để tiết kiệm tài nguyên và tránh lỗi.

| Pattern | Hiểu đơn giản | Fluxify áp dụng | Lợi ích chính |
|---|---|---|---|
| Singleton | Chỉ giữ một instance dùng chung | Các client hạ tầng quan trọng được tái sử dụng thay vì tạo mới liên tục | Giảm tải tài nguyên, giảm lỗi kết nối |
| Lazy Initialization | Khi nào cần mới tạo | Dịch vụ ngoài chỉ khởi tạo tại thời điểm thực sự sử dụng | Khởi động nhanh hơn, giảm chi phí ban đầu |
| Factory Method | Chọn cách tạo theo ngữ cảnh | Backend rate limit được chọn theo môi trường triển khai | Linh hoạt, không sửa nghiệp vụ khi đổi hạ tầng |
| Object Pool | Tái sử dụng tài nguyên đắt đỏ | Kết nối dữ liệu được quản lý theo pool | Tăng hiệu năng, ổn định khi nhiều request đồng thời |

Diễn giải dễ hiểu:
1. Thay vì tạo mới mọi thứ ở mỗi request, hệ thống tái sử dụng tài nguyên có kiểm soát.
2. Điều này đặc biệt quan trọng với đối tượng tốn kém như kết nối cơ sở dữ liệu hoặc client dịch vụ ngoài.

### 3.2. Nhóm cấu trúc (Structural)

Nhóm này trả lời: ghép các phần của hệ thống thế nào để dễ thay đổi và ít phụ thuộc chéo.

| Pattern | Hiểu đơn giản | Fluxify áp dụng | Lợi ích chính |
|---|---|---|---|
| Facade | Đưa ra một "cửa vào" đơn giản | Lớp gọi API thống nhất và lớp tiện ích tích hợp dịch vụ ngoài | Giảm độ phức tạp cho tầng giao diện |
| Adapter | Nối hai phần không cùng chuẩn | Lớp truy cập dữ liệu dùng adapter để kết hợp ORM với driver kết nối | Tận dụng ưu điểm của nhiều công nghệ cùng lúc |
| Decorator/Wrapper | Bọc thêm chức năng mà không sửa lõi | Store và component được bọc thêm hành vi như persist, loading, chọn thành phần | Mở rộng nhanh, ít rủi ro phá chức năng cũ |
| Composite-like | Xử lý nhiều phần tử như một cấu trúc chung | Shop được dựng từ danh sách block có cùng hợp đồng dữ liệu | Dễ thêm block mới, dễ sắp xếp và render động |

Diễn giải dễ hiểu:
1. Nhóm cấu trúc giúp hệ thống "ghép khối" tốt hơn.
2. Khi cần thay đổi một phần, ảnh hưởng lan sang phần khác sẽ giảm rõ rệt.

### 3.3. Nhóm hành vi (Behavioral)

Nhóm này trả lời: các thành phần trao đổi dữ liệu và phối hợp xử lý như thế nào trong runtime.

| Pattern | Hiểu đơn giản | Fluxify áp dụng | Lợi ích chính |
|---|---|---|---|
| Strategy | Chọn cách xử lý phù hợp từng tình huống | Chọn chiến lược lưu rate limit, chọn cách fetch/validate theo ngữ cảnh | Giảm rẽ nhánh cứng, dễ thay thuật toán |
| Observer (Pub-Sub) | Một nơi phát sự kiện, nơi khác tự nhận | Đồng bộ trạng thái chat và đăng xuất giữa nhiều tab trình duyệt | Cập nhật trạng thái nhanh, ít thao tác thủ công |
| Chain of Responsibility | Kiểm tra theo chuỗi, sai là dừng sớm | Bảo vệ route theo các bước: trạng thái tài khoản -> đăng nhập -> vai trò | Chính sách truy cập rõ ràng, dễ kiểm toán |
| State-driven workflow | Trạng thái đổi thì hành vi đổi theo | Luồng builder/giỏ hàng vận hành theo các trạng thái xử lý | UI phản hồi đúng ngữ cảnh, giảm lỗi thao tác |

Diễn giải dễ hiểu:
1. Nhóm hành vi làm rõ cách hệ thống "ra quyết định" khi đang chạy.
2. Nhờ vậy, trải nghiệm người dùng ổn định hơn và logic nghiệp vụ dễ kiểm soát hơn.

## 4. Kịch bản thực tế để kiểm chứng

### Kịch bản 1: Vendor dựng trang shop

1. Vendor thêm các block nội dung để xây trang.
2. Hệ thống cho phản hồi giao diện ngay để thao tác mượt.
3. Khi lưu, dữ liệu được đồng bộ theo transaction để tránh lệch thứ tự hoặc mất block.

Ý nghĩa: kết hợp tốt giữa trải nghiệm realtime và tính nhất quán dữ liệu.

### Kịch bản 2: Đồng bộ thông báo chat chưa đọc

1. Khi có thay đổi chat, một tab phát sự kiện.
2. Tab khác nhận sự kiện và cập nhật số lượng chưa đọc.

Ý nghĩa: người dùng mở nhiều tab vẫn thấy cùng một trạng thái.

### Kịch bản 3: Đăng xuất trên nhiều tab

1. Tab đăng xuất phát tín hiệu toàn cục.
2. Các tab còn lại tự cập nhật trạng thái phiên.

Ý nghĩa: giảm rủi ro giữ session cũ không đồng bộ.

### Kịch bản 4: Bảo vệ khu vực quản trị

1. Chưa đăng nhập thì không vào được khu vực cần quyền.
2. Đăng nhập nhưng sai vai trò cũng không truy cập được.
3. Tài khoản bị vô hiệu hóa bị chặn và được điều hướng phù hợp.

Ý nghĩa: bảo mật theo nguyên tắc kiểm tra nhiều lớp.

### Kịch bản 5: Tăng độ bền khi gọi API

1. Request có timeout và cơ chế retry khi lỗi mạng tạm thời.
2. Lỗi không nên retry (đa số 4xx) được dừng sớm để tránh tạo tải thừa.

Ý nghĩa: hệ thống ổn định hơn khi mạng không tốt hoặc tải cao.

## 5. Kết luận chương

1. Fluxify phù hợp với **modular monolith** trong bối cảnh đồ án hiện tại.
2. **N-layered architecture** giúp phân tầng trách nhiệm rõ ràng, dễ bảo trì.
3. Ba nhóm pattern được áp dụng nhất quán, gồm: tạo dựng (tối ưu cách tạo và tái sử dụng đối tượng), cấu trúc (giảm phụ thuộc và tăng khả năng thay đổi thành phần), và hành vi (điều phối xử lý linh hoạt theo trạng thái và ngữ cảnh runtime).

Chốt lại, cách thiết kế hiện tại giúp hệ thống đạt ba mục tiêu quan trọng: **dễ phát triển**, **dễ vận hành**, **dễ mở rộng theo từng giai đoạn**.
