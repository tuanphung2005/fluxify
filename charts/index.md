# Sơ đồ kiến trúc

Thư mục này chứa mã nguồn PlantUML cho tài liệu kiến trúc Fluxify.

Đối chiếu chính thức theo đề bài xem tại [00-requirement-mapping.md](../docs/architecture/00-requirement-mapping.md).

## 1. Nhóm bắt buộc theo đề

### I. Tổng quan và giới thiệu
Phần này nằm trong tài liệu:
- [01-system-overview.md](../docs/architecture/01-system-overview.md)
- [02-quality-attributes-nfr.md](../docs/architecture/02-quality-attributes-nfr.md)

### II. Đặc tả và mô hình hóa yêu cầu (UML)
- Use Case Diagram: [uml-00-system-usecase-diagram.puml](uml/uml-00-system-usecase-diagram.puml)
- Activity Diagram: [uml-06-product-lifecycle-activity.puml](uml/uml-06-product-lifecycle-activity.puml), [uml-08-shop-template-lifecycle-activity.puml](uml/uml-08-shop-template-lifecycle-activity.puml), [uml-09-checkout-activity.puml](uml/uml-09-checkout-activity.puml)

### III. Cấu trúc và hành vi (UML)
- Class Diagram: [uml-01-domain-class-model.puml](uml/uml-01-domain-class-model.puml)
- Sequence Diagram: [uml-03-checkout-sequence.puml](uml/uml-03-checkout-sequence.puml), [uml-04-vendor-operations-sequence.puml](uml/uml-04-vendor-operations-sequence.puml), [uml-05-auth-registration-sequence.puml](uml/uml-05-auth-registration-sequence.puml)

### IV. Kiến trúc và mẫu thiết kế
- C4 Level 1: [c4-01-system-context.puml](c4/c4-01-system-context.puml)
- C4 Level 2: [c4-02-container-view.puml](c4/c4-02-container-view.puml)
- Tài liệu kiến trúc, mẫu kiến trúc, design pattern: [06-architecture-and-design-patterns.md](../docs/architecture/06-architecture-and-design-patterns.md)

### V. Minh chứng phần mềm
Phần này nằm trong tài liệu:
- [08-software-evidence-and-demo.md](../docs/architecture/08-software-evidence-and-demo.md)

## 2. Nhóm bổ trợ đang giữ

- C4 Level 3 theo phân hệ:
	- [c4-03-order-processing-components.puml](c4/c4-03-order-processing-components.puml)
	- [c4-04-shop-builder-components.puml](c4/c4-04-shop-builder-components.puml)
	- [c4-05-chat-components.puml](c4/c4-05-chat-components.puml)
	- [c4-06-vendor-admin-components.puml](c4/c4-06-vendor-admin-components.puml)
- UML bổ trợ:
	- [uml-02-backend-package-diagram.puml](uml/uml-02-backend-package-diagram.puml)
	- [uml-07-order-state-machine.puml](uml/uml-07-order-state-machine.puml)

## 3. Cấu trúc thư mục

- [shared](shared): Các tệp dùng chung cho theme/chú giải.
- [c4](c4): Các sơ đồ kiến trúc theo mô hình C4.
- [uml](uml): Các sơ đồ UML về yêu cầu, cấu trúc và hành vi.

## 4. Kiểm tra hợp lệ

Nếu đã cài PlantUML cục bộ, chạy kiểm tra cú pháp:

```powershell
Get-ChildItem charts -Recurse -Filter *.puml | ForEach-Object { plantuml -checkonly $_.FullName }
```
