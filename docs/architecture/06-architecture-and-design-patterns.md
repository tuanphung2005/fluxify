# 06. Kiến trúc, Mẫu kiến trúc và Mẫu thiết kế

## Mục tiêu chương

Chương này giải thích theo cách dễ hiểu ba nội dung chính của Fluxify:
1. Hệ thống đang dùng loại kiến trúc nào.
2. Cách tổ chức các lớp chức năng trong kiến trúc đó.
3. Các mẫu thiết kế (design pattern) tiêu biểu theo ba nhóm: tạo dựng, cấu trúc, hành vi.

Nội dung được trình bày theo phong cách báo cáo: định nghĩa ngắn gọn, cách áp dụng trong dự án và lợi ích thực tế.

## 1. Kiến trúc hệ thống được chọn

### 1.1. Định nghĩa: Modular Monolith (Kiến trúc nguyên khối mô-đun)

#### Nguồn gốc và bối cảnh

**Monolith** (nguyên khối) là dạng kiến trúc phần mềm truyền thống, trong đó toàn bộ chức năng của hệ thống — từ giao diện người dùng, xử lý nghiệp vụ đến truy xuất dữ liệu — được đóng gói và triển khai thống nhất trong một đơn vị duy nhất. Đây là dạng kiến trúc xuất hiện từ những năm đầu của kỹ thuật phần mềm và vẫn tiếp tục được sử dụng rộng rãi cho đến ngày nay.

Tuy nhiên, monolith truyền thống thường bị chỉ trích vì dễ trở thành **"big ball of mud"** — tức là một khối mã nguồn khổng lồ không có ranh giới rõ ràng giữa các chức năng. Để giải quyết vấn đề này, **Modular Monolith** (nguyên khối mô-đun) ra đời như một phương án trung gian, kết hợp sự đơn giản của kiến trúc nguyên khối với kỷ luật tổ chức của kiến trúc hướng dịch vụ.

Khái niệm này được nhắc đến nhiều trong các nghiên cứu của Sam Newman (*Building Microservices*, O'Reilly, 2015) và được cộng đồng phần mềm nhìn nhận là điểm xuất phát lý tưởng trước khi một hệ thống cần chuyển sang microservice.

#### Định nghĩa kỹ thuật

Modular Monolith là một kiểu tổ chức hệ thống phần mềm thỏa mãn đồng thời hai đặc điểm:

1. **Đơn vị triển khai duy nhất (Single deployable unit):** Toàn bộ hệ thống được đóng gói và chạy trong một tiến trình duy nhất, chia sẻ chung bộ nhớ và cơ sở hạ tầng runtime.
2. **Phân chia theo ranh giới nghiệp vụ rõ ràng (Explicit business boundaries):** Bên trong đơn vị đó, mã nguồn được tổ chức thành các **mô-đun** (module) hoặc **miền nghiệp vụ** (domain) độc lập, với giao diện (interface/contract) được định nghĩa tường minh. Mỗi mô-đun chỉ được phép truy cập vào trạng thái nội tại của mình; giao tiếp giữa các mô-đun phải đi qua lớp công khai (public API) của mô-đun đó.

#### Đặc điểm nhận dạng

| Đặc điểm | Mô tả |
|---|---|
| **Triển khai đơn thể** | Một lần build, một tiến trình duy nhất, một lần deploy |
| **Ranh giới mô-đun** | Mỗi mô-đun nghiệp vụ có thư mục riêng, export chỉ những gì cần thiết |
| **Không giao tiếp trực tiếp qua lớp nội bộ** | Mô-đun A không được import trực tiếp implementation của mô-đun B |
| **Chia sẻ hạ tầng** | Cùng database, cùng hệ thống xác thực, cùng logging/monitoring |
| **Độc lập về nghiệp vụ** | Logic của mô-đun này không phụ thuộc vào chi tiết cài đặt của mô-đun kia |

#### Ưu điểm của Modular Monolith

1. **Đơn giản hóa vận hành:** Không cần quản lý nhiều dịch vụ, không cần service discovery, API gateway hay distributed tracing. Một tiến trình duy nhất dễ monitor và debug hơn.
2. **Tốc độ phát triển cao:** Gọi hàm nội bộ nhanh hơn gọi mạng. Developer không cần dựng toàn bộ hệ sinh thái dịch vụ chỉ để chạy thử một tính năng.
3. **Tái cấu trúc dễ hơn so với microservice:** Vì tất cả code ở cùng một nơi, IDE và công cụ refactoring có thể phân tích toàn bộ codebase và phát hiện lỗi tại compile-time thay vì runtime.
4. **Ranh giới mô-đun là bước chuẩn bị cho microservice:** Nếu một mô-đun cần được tách ra thành dịch vụ riêng, ranh giới đã rõ ràng sẵn — đây là chiến lược "strangler fig" kinh điển.
5. **Dễ kiểm thử tích hợp:** Không cần mock nhiều service thật sự; có thể chạy test end-to-end trong một tiến trình.

#### Nhược điểm và rủi ro cần nhận biết

1. **Giới hạn mở rộng theo chiều ngang:** Khi cần scale một phần hệ thống chịu tải cao, phải scale toàn bộ ứng dụng thay vì chỉ mô-đun đó.
2. **Rủi ro ô nhiễm ranh giới:** Nếu không có convention và linting chặt, các mô-đun dễ bị phụ thuộc chéo lẫn nhau theo thời gian, dẫn về dạng monolith không có cấu trúc.
3. **Cùng runtime, cùng rủi ro:** Lỗi memory leak hoặc crash ở một mô-đun ảnh hưởng toàn bộ hệ thống.

### 1.2. Định nghĩa: Traditional Monolith (Kiến trúc nguyên khối truyền thống)

#### Nguồn gốc và bối cảnh

Traditional Monolith là dạng kiến trúc phần mềm xuất hiện sớm nhất trong lịch sử kỹ thuật phần mềm, bắt nguồn từ thời kỳ máy tính mainframe thập niên 1950–1960 khi tài nguyên phần cứng còn rất hạn chế và chưa có khái niệm phân tán. Toàn bộ ứng dụng — từ giao diện người dùng đến xử lý nghiệp vụ và truy cập cơ sở dữ liệu — được viết, biên dịch và triển khai như một đơn vị duy nhất, thường là một tệp thực thi hoặc một gói triển khai (WAR, JAR, DLL...).

#### Định nghĩa kỹ thuật

Traditional Monolith là kiểu kiến trúc trong đó tất cả các thành phần chức năng của hệ thống **cùng nằm trong một codebase, cùng biên dịch thành một artifact duy nhất và cùng chạy trong một tiến trình duy nhất**, không có ranh giới kỹ thuật hay nghiệp vụ rõ ràng giữa các phần. Mọi module có thể gọi trực tiếp sang module khác mà không qua bất kỳ lớp trung gian nào.

#### Đặc điểm nhận dạng

| Đặc điểm | Mô tả |
|---|---|
| **Một codebase duy nhất** | Tất cả code nằm chung, không phân tách theo ranh giới nghiệp vụ |
| **Phụ thuộc ngầm định** | Các module gọi nhau trực tiếp, không qua interface hay contract |
| **Triển khai toàn bộ mỗi lần** | Thay đổi dù nhỏ cũng phải build và deploy toàn bộ hệ thống |
| **Cùng database** | Tất cả chức năng dùng chung một cơ sở dữ liệu duy nhất |
| **Khó kiểm thử độc lập** | Không thể test một phần mà không kéo theo toàn bộ codebase |

#### Ưu điểm của Traditional Monolith

1. **Đơn giản để bắt đầu:** Không cần thiết lập hạ tầng phức tạp. Developer chạy một lệnh là có toàn bộ ứng dụng.
2. **Debug trực tiếp:** Stack trace rõ ràng từ giao diện xuống database trong một luồng liên tục.
3. **Không có độ trễ mạng nội bộ:** Mọi lời gọi đều là gọi hàm trong bộ nhớ, tốc độ tối đa.
4. **Transaction đơn giản:** Tất cả nghiệp vụ có thể bọc trong một database transaction duy nhất.

#### Nhược điểm của Traditional Monolith

1. **"Big ball of mud":** Theo thời gian, code trở thành một mạng lưới phụ thuộc chằng chịt, không ai hiểu toàn bộ hệ thống.
2. **Rào cản triển khai cao:** Mỗi lần deploy là rủi ro cho toàn bộ hệ thống, dù chỉ sửa một dòng code.
3. **Không thể scale từng phần:** Nếu chỉ tính năng đặt hàng chịu tải cao, vẫn phải scale toàn bộ ứng dụng.
4. **Khó làm việc nhóm:** Nhiều developer sửa cùng một codebase dễ dẫn đến xung đột và lỗi hồi quy.
5. **Ràng buộc công nghệ:** Toàn bộ hệ thống phải dùng cùng một ngôn ngữ, framework và phiên bản thư viện.

---

### 1.3. Định nghĩa: SOA — Service-Oriented Architecture (Kiến trúc hướng dịch vụ)

#### Nguồn gốc và bối cảnh

SOA xuất hiện vào cuối thập niên 1990 và phổ biến rộng rãi trong thập niên 2000, được thúc đẩy bởi nhu cầu tích hợp các hệ thống doanh nghiệp lớn vốn được xây dựng bằng nhiều công nghệ khác nhau. Các tổ chức như IBM, Microsoft và Oracle đẩy mạnh SOA thông qua các chuẩn kỹ thuật như SOAP, WSDL và ESB (Enterprise Service Bus).

SOA được xem là phản ứng của ngành công nghiệp phần mềm trước vấn đề "silo hóa" hệ thống: mỗi phòng ban trong doanh nghiệp có hệ thống riêng, không nói chuyện được với nhau. SOA đề xuất tổ chức lại thành các **dịch vụ (service)** có thể tái sử dụng và kết hợp linh hoạt.

#### Định nghĩa kỹ thuật

SOA là một mô hình kiến trúc phần mềm trong đó các chức năng của hệ thống được tổ chức thành **tập hợp các dịch vụ rời rạc, có thể khám phá và tái sử dụng**, giao tiếp với nhau qua các **giao thức chuẩn hóa** (thường là SOAP/HTTP hoặc AMQP). Mỗi dịch vụ đại diện cho một năng lực nghiệp vụ (business capability) độc lập, có interface được định nghĩa chính thức, và không phụ thuộc vào cách cài đặt nội bộ của dịch vụ khác.

Thành phần đặc trưng của SOA cổ điển bao gồm:
- **Service Provider:** Dịch vụ cung cấp chức năng.
- **Service Consumer:** Bên gọi dịch vụ.
- **Service Registry (UDDI):** Nơi đăng ký và tra cứu dịch vụ.
- **ESB (Enterprise Service Bus):** Tầng trung gian điều phối thông điệp giữa các dịch vụ.

#### Đặc điểm nhận dạng

| Đặc điểm | Mô tả |
|---|---|
| **Dịch vụ có thể tái sử dụng** | Mỗi service được thiết kế để dùng lại trong nhiều ngữ cảnh khác nhau |
| **Giao tiếp qua chuẩn mở** | SOAP, WSDL, REST, AMQP — giao tiếp qua mạng với hợp đồng rõ ràng |
| **ESB làm trung gian** | Điều phối, chuyển đổi định dạng và định tuyến thông điệp |
| **Kết hợp dịch vụ (Orchestration)** | Một dịch vụ điều phối các dịch vụ khác theo quy trình nghiệp vụ |
| **Chia sẻ dữ liệu qua dịch vụ** | Không truy cập thẳng database của nhau; trao đổi qua API |

#### Ưu điểm của SOA

1. **Tái sử dụng nghiệp vụ:** Một dịch vụ "Xác thực người dùng" có thể được dùng bởi nhiều hệ thống khác nhau trong cùng doanh nghiệp.
2. **Tích hợp hệ thống dị biệt:** Kết nối được các hệ thống cũ (legacy) với hệ thống mới mà không cần viết lại.
3. **Phân tách theo nghiệp vụ:** Mỗi team có thể phát triển dịch vụ của mình theo nhịp độ riêng.
4. **Khả năng thay thế:** Có thể thay thế một dịch vụ bằng cách cài đặt khác miễn là giữ nguyên interface.

#### Nhược điểm của SOA

1. **ESB là điểm nghẽn và điểm hỏng duy nhất:** Nếu ESB bị lỗi hoặc quá tải, toàn bộ hệ thống bị ảnh hưởng.
2. **Chi phí vận hành cao:** Cần đội ngũ chuyên biệt để quản lý ESB, registry và luồng tích hợp.
3. **Giao tiếp nặng nề:** SOAP/XML có overhead lớn so với gọi hàm trực tiếp hoặc REST/JSON.
4. **Vendor lock-in:** Nhiều triển khai SOA gắn chặt với sản phẩm thương mại của IBM, Oracle, Microsoft.
5. **Khó phát triển nhanh:** Quy trình định nghĩa WSDL, đăng ký dịch vụ, tích hợp ESB tốn thời gian.

---

### 1.4. Định nghĩa: Microservices Architecture (Kiến trúc vi dịch vụ)

#### Nguồn gốc và bối cảnh

Microservices là kiến trúc phát triển từ nhu cầu thực tế của các công ty internet quy mô lớn — Netflix, Amazon, Uber, Spotify — khi monolith không còn đáp ứng được yêu cầu về tốc độ deploy và khả năng scale độc lập. Thuật ngữ "microservices" được phổ biến hóa qua bài viết của Martin Fowler và James Lewis năm 2014 (*Microservices*, martinfowler.com), mặc dù các công ty như Amazon đã áp dụng từ đầu thập niên 2000.

Microservices có thể xem là SOA được "tinh giản hóa": loại bỏ ESB nặng nề, thay bằng giao tiếp trực tiếp qua API nhẹ (thường là HTTP/REST hoặc gRPC), và nhấn mạnh mạnh hơn vào ranh giới dịch vụ nhỏ và độc lập triển khai.

#### Định nghĩa kỹ thuật

Microservices là phong cách kiến trúc trong đó một ứng dụng được xây dựng từ tập hợp các **dịch vụ nhỏ, độc lập**, mỗi dịch vụ:
- Chạy trong tiến trình riêng của mình.
- Giao tiếp qua cơ chế nhẹ (thường là HTTP API hoặc message queue).
- Được triển khai độc lập, không cần deploy toàn bộ hệ thống.
- Quản lý dữ liệu riêng (mỗi service có database riêng hoặc schema riêng).
- Được xây dựng xung quanh một khả năng nghiệp vụ (business capability) cụ thể.

#### Đặc điểm nhận dạng

| Đặc điểm | Mô tả |
|---|---|
| **Tiến trình độc lập** | Mỗi service chạy trong container/process riêng, có thể restart độc lập |
| **Database per service** | Không chia sẻ database trực tiếp; trao đổi qua API hoặc event |
| **Deploy độc lập** | Team A deploy service của mình mà không ảnh hưởng team B |
| **Tự trị công nghệ** | Service A dùng Node.js, service B dùng Go — hoàn toàn hợp lệ |
| **Giao tiếp qua mạng** | Mọi lời gọi giữa service đều qua HTTP, gRPC, hoặc message broker |
| **Hạ tầng phức tạp** | Cần service discovery, load balancer, API gateway, circuit breaker, distributed tracing |

#### Ưu điểm của Microservices

1. **Scale độc lập từng dịch vụ:** Chỉ service đặt hàng bị quá tải thì chỉ cần scale service đó, không ảnh hưởng phần còn lại.
2. **Deploy độc lập:** Nhiều team có thể release đồng thời mà không cần phối hợp deploy chung.
3. **Linh hoạt công nghệ:** Mỗi service chọn ngôn ngữ, framework, database phù hợp nhất với bài toán của nó.
4. **Khả năng chịu lỗi (fault isolation):** Lỗi ở một service không kéo toàn bộ hệ thống xuống (nếu thiết kế đúng).
5. **Phù hợp đội nhóm lớn:** Mỗi team sở hữu (own) một hoặc vài service, giảm xung đột code.

#### Nhược điểm của Microservices

1. **Phức tạp vận hành đột biến:** Cần container orchestration (Kubernetes), service mesh, API gateway, centralized logging, distributed tracing — chi phí hạ tầng rất lớn.
2. **Distributed systems problems:** Mạng không đáng tin cậy, cần xử lý timeout, retry, circuit breaker, eventual consistency.
3. **Distributed transaction khó:** Không thể dùng ACID transaction thông thường khi dữ liệu trải trên nhiều service; phải dùng Saga pattern hoặc 2-phase commit.
4. **Chi phí giao tiếp mạng:** Mỗi lời gọi giữa service đều có độ trễ mạng và nguy cơ lỗi, thay vì gọi hàm tức thời.
5. **Khó test tích hợp:** Cần dựng toàn bộ hệ sinh thái service để test một luồng end-to-end.
6. **Overkill với quy mô nhỏ:** Hầu hết lợi ích của microservice chỉ phát huy khi hệ thống đủ lớn và đội nhóm đủ đông.

---

### 1.5. So sánh tổng thể các phương án kiến trúc

| Tiêu chí | Traditional Monolith | Modular Monolith *(được chọn)* | SOA | Microservices |
|---|---|---|---|---|
| **Độ phức tạp triển khai** | Thấp nhất | Thấp | Cao | Rất cao |
| **Tốc độ phát triển ban đầu** | Nhanh nhất | Nhanh | Chậm | Chậm |
| **Ranh giới nghiệp vụ** | Không có | Rõ ràng (trong process) | Rõ ràng (qua ESB) | Rõ ràng (qua mạng) |
| **Khả năng scale độc lập** | Không | Không | Có (theo service) | Có (theo service) |
| **Chi phí vận hành** | Thấp nhất | Thấp | Cao | Rất cao |
| **Khả năng bảo trì lâu dài** | Thấp (big ball of mud) | Tốt | Trung bình | Tốt (nếu vận hành đúng) |
| **Phù hợp đội nhỏ** | Có | Có | Không | Không |
| **Phù hợp đồ án hiện tại** | Trung bình | **Cao** | Thấp | Thấp |

### 1.6. Lý do lựa chọn Modular Monolith cho Fluxify

Sau khi phân tích bốn phương án kiến trúc, Fluxify chọn **Modular Monolith** dựa trên các lập luận sau:

**Traditional Monolith bị loại vì:** Dù đơn giản nhất, nó không đảm bảo tính tổ chức codebase về lâu dài. Fluxify có nhiều mô-đun nghiệp vụ phức tạp (auth, post, media, shop, order, chat) — nếu không có ranh giới rõ ràng, codebase sẽ nhanh chóng trở thành "big ball of mud" và khó bảo trì.

**SOA bị loại vì:** SOA phù hợp với bài toán tích hợp nhiều hệ thống doanh nghiệp lớn, không phải bài toán xây mới từ đầu. Chi phí thiết lập ESB, định nghĩa WSDL, quản lý service registry vượt xa lợi ích mà một đồ án quy mô nhỏ có thể nhận được.

**Microservices bị loại vì:** Lợi ích của microservices chỉ phát huy khi hệ thống đủ lớn, đội nhóm đủ đông và có hạ tầng cloud mạnh. Fluxify ở giai đoạn đồ án không có những điều kiện đó. Việc phải vận hành Kubernetes, API gateway, distributed tracing, xử lý distributed transaction sẽ chiếm phần lớn thời gian phát triển mà không tạo ra giá trị nghiệp vụ.

**Modular Monolith được chọn vì:**
1. **Quy mô phù hợp:** Hệ thống có nhiều vai trò (khách hàng, vendor, admin) nhưng lượng người dùng trong giai đoạn đồ án chưa đòi hỏi scale phân tán.
2. **Đội phát triển nhỏ:** Duy trì một codebase thống nhất giúp tập trung năng lực vào hoàn thiện chức năng thay vì quản lý hạ tầng dịch vụ.
3. **Ranh giới nghiệp vụ được bảo toàn:** Fluxify duy trì ranh giới mô-đun nghiêm ngặt (auth, post, media, shop, order...) — giải quyết nhược điểm của Traditional Monolith mà không tăng độ phức tạp vận hành.
4. **Con đường nâng cấp rõ ràng:** Khi hệ thống lớn lên, các mô-đun với ranh giới đã rõ có thể được tách thành microservice từng bước theo chiến lược "strangler fig" — không cần viết lại từ đầu.
5. **Chi phí vận hành tối thiểu:** Một tiến trình duy nhất, một lần deploy, một hệ thống monitoring — phù hợp với nguồn lực hiện có.

**Kết luận:** Modular Monolith không phải là giải pháp tạm thời hay thỏa hiệp. Đây là lựa chọn **có chủ đích và phù hợp với giai đoạn hiện tại**, cân bằng tốt giữa **tốc độ phát triển**, **độ ổn định** và **chi phí vận hành**. Khi Fluxify cần mở rộng quy mô trong tương lai, kiến trúc này cung cấp nền tảng vững chắc để chuyển đổi từng bước sang kiến trúc phân tán.

## 2. Mẫu kiến trúc được chọn

### 2.1. Định nghĩa: N-Layered Architecture (Kiến trúc phân tầng)

#### Khái niệm

**N-Layered Architecture** (hay Layered Architecture / Tiered Architecture) là một mẫu kiến trúc phần mềm trong đó hệ thống được chia thành **N tầng nằm chồng lên nhau theo thứ bậc**. Mỗi tầng chỉ được phép giao tiếp với tầng kề bên dưới nó (nguyên tắc *strict layering*) hoặc với bất kỳ tầng nào phía dưới (nguyên tắc *relaxed layering*).

Mỗi tầng đảm nhận một nhóm trách nhiệm riêng biệt và rõ ràng. Đây là ứng dụng trực tiếp của nguyên lý **Separation of Concerns (SoC)** — một trong những nguyên lý nền tảng của kỹ thuật phần mềm.

Mô hình phân tầng lần đầu được hệ thống hóa bởi Edsger Dijkstra vào cuối thập niên 1960 và sau đó được áp dụng rộng rãi trong các hệ thống doanh nghiệp (enterprise software) từ thập niên 1990 đến nay.

#### Cấu trúc tầng trong Fluxify

Fluxify tổ chức theo **4 tầng chính** bên trong monolith, mỗi tầng làm đúng một nhóm việc:

| Tầng | Chức năng chính | Ví dụ trong Fluxify |
|---|---|---|
| **Presentation** | Hiển thị giao diện và nhận thao tác người dùng | Trang cho khách hàng, vendor, admin và các thành phần UI |
| **API / Interface** | Nhận request, kiểm soát truy cập, định dạng phản hồi | Kiểm tra đăng nhập, phân quyền theo vai trò, chuẩn hóa response |
| **Business / Application** | Xử lý quy tắc nghiệp vụ và điều phối use case | Kiểm tra dữ liệu đầu vào, quản lý luồng đặt hàng, phê duyệt bài đăng |
| **Data / Infrastructure** | Làm việc với dữ liệu và dịch vụ ngoài | Ghi đọc database, gửi email, upload media, rate limiting, QR thanh toán |

#### Nguyên tắc vận hành

- **Chiều phụ thuộc đi xuống:** Tầng trên được phép gọi tầng dưới, không bao giờ ngược lại.
- **Không bỏ qua tầng:** Presentation không gọi thẳng xuống tầng Data; mọi nghiệp vụ phải đi qua tầng Business.
- **Mỗi tầng có contract rõ ràng:** Tầng trên không quan tâm đến cài đặt nội bộ của tầng dưới, chỉ biết interface của nó.

### 2.2. So sánh N-Layered với các mẫu kiến trúc phổ biến khác

| Mẫu kiến trúc | Đặc điểm nổi bật | Điểm mạnh | Điểm yếu | Mức phù hợp |
|---|---|---|---|---|
| **N-Layered** *(được chọn)* | Phân tầng theo nhóm trách nhiệm | Dễ hiểu, dễ học, phù hợp hầu hết dự án web | Có thể tạo phụ thuộc giữa các tầng nếu không cẩn thận | **Cao** |
| **MVC** (Model-View-Controller) | Tách biệt dữ liệu, hiển thị và điều khiển | Phù hợp giao diện web truyền thống, nhiều framework hỗ trợ | Không quy định rõ nơi chứa nghiệp vụ phức tạp, dễ phình to ở Controller | Trung bình |
| **Clean Architecture / Hexagonal** | Domain logic ở trung tâm, hoàn toàn độc lập với hạ tầng | Rất dễ kiểm thử độc lập, linh hoạt thay đổi hạ tầng | Overhead cấu trúc lớn với dự án vừa và nhỏ, khó đào tạo | Trung bình |
| **Event-Driven Architecture** | Giao tiếp qua sự kiện bất đồng bộ | Tách biệt hoàn toàn, scale tốt | Phức tạp về debugging và đảm bảo thứ tự xử lý | Thấp |
| **CQRS + Event Sourcing** | Tách đọc/ghi, lưu lịch sử thay đổi như chuỗi sự kiện | Audit trail đầy đủ, scale đọc/ghi độc lập | Cực kỳ phức tạp, overkill với phần lớn use case | Thấp |

### 2.3. Lý do chọn N-Layered thay vì các mẫu khác

**So với MVC:**
MVC rất phổ biến nhưng không quy định rõ nơi chứa nghiệp vụ phức tạp. Khi use case như "đặt hàng" cần kiểm tra tồn kho, tính phí vận chuyển, tạo transaction và gửi thông báo — tất cả logic này không có chỗ rõ ràng trong MVC, dễ dồn hết vào Controller hoặc Model và gây rối. N-Layered giải quyết điều này bằng tầng Business chuyên biệt.

**So với Clean Architecture / Hexagonal:**
Clean Architecture có độ tách biệt cao hơn nhưng đòi hỏi cấu trúc phức tạp hơn (ports, adapters, use case classes, domain entities...). Với quy mô và đội ngũ hiện tại của Fluxify, overhead này không mang lại lợi ích tương xứng. N-Layered cho kết quả tương đương với chi phí cấu trúc thấp hơn nhiều.

**So với Event-Driven:**
Event-Driven phù hợp khi cần tách biệt hoàn toàn các dịch vụ và xử lý bất đồng bộ quy mô lớn. Với Fluxify là monolith và phần lớn luồng cần đảm bảo tính nhất quán đồng bộ (đặt hàng, thanh toán), Event-Driven sẽ làm tăng độ phức tạp mà không giải quyết thêm vấn đề gì.

**Kết luận chọn N-Layered:**
N-Layered architecture cung cấp cấu trúc đủ rõ ràng để phân tách trách nhiệm, dễ học, được hỗ trợ bởi phần lớn tài liệu và framework hiện đại, và phù hợp với quy mô của Fluxify. Đây là mẫu kiến trúc kinh điển, đã được kiểm chứng qua hàng thập kỷ trong các hệ thống doanh nghiệp thực tế.

### 2.4. Ví dụ luồng điển hình: tạo đơn hàng

1. Người dùng gửi yêu cầu đặt hàng từ giao diện (Presentation).
2. API nhận yêu cầu, kiểm tra điều kiện truy cập và giới hạn tần suất (API/Interface).
3. Tầng nghiệp vụ kiểm tra dữ liệu đầu vào và tồn kho (Business/Application).
4. Tầng dữ liệu ghi các thay đổi trong transaction để đảm bảo nhất quán (Data/Infrastructure).
5. API trả kết quả theo một định dạng thống nhất để giao diện xử lý.

**Ý nghĩa của N-layered:** Mỗi tầng rõ trách nhiệm, nên hệ thống dễ bảo trì và dễ mở rộng chức năng mới mà không làm ảnh hưởng toàn bộ codebase.

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
