# Fluxify - Bộ tài liệu Kiến trúc Phần mềm

Đây là chỉ mục chính cho hồ sơ nộp môn Kiến trúc và Thiết kế phần mềm.

Điểm bắt đầu để đối chiếu theo đề bài: [00-requirement-mapping.md](00-requirement-mapping.md).

## 1. Hồ sơ bắt buộc theo đề (I -> V)

### I. Tổng quan và giới thiệu
- [01-system-overview.md](01-system-overview.md)
- [02-quality-attributes-nfr.md](02-quality-attributes-nfr.md)

### II. Đặc tả và mô hình hóa yêu cầu (UML)
- [07-use-case-specifications.md](07-use-case-specifications.md)
- [uml-00-system-usecase-diagram.puml](../../charts/uml/uml-00-system-usecase-diagram.puml)
- [uml-06-product-lifecycle-activity.puml](../../charts/uml/uml-06-product-lifecycle-activity.puml)
- [uml-08-shop-template-lifecycle-activity.puml](../../charts/uml/uml-08-shop-template-lifecycle-activity.puml)
- [uml-09-checkout-activity.puml](../../charts/uml/uml-09-checkout-activity.puml)

### III. Cấu trúc và hành vi (UML)
- [uml-01-domain-class-model.puml](../../charts/uml/uml-01-domain-class-model.puml)
- [uml-03-checkout-sequence.puml](../../charts/uml/uml-03-checkout-sequence.puml)
- [uml-04-vendor-operations-sequence.puml](../../charts/uml/uml-04-vendor-operations-sequence.puml)
- [uml-05-auth-registration-sequence.puml](../../charts/uml/uml-05-auth-registration-sequence.puml)

### IV. Kiến trúc và mẫu thiết kế
- [06-architecture-and-design-patterns.md](06-architecture-and-design-patterns.md)
- [c4-01-system-context.puml](../../charts/c4/c4-01-system-context.puml)
- [c4-02-container-view.puml](../../charts/c4/c4-02-container-view.puml)

### V. Minh chứng phần mềm
- [08-software-evidence-and-demo.md](08-software-evidence-and-demo.md)
- [README.md](evidence/README.md)

## 2. Hồ sơ bổ trợ đang giữ

- [03-deployment-and-operations.md](03-deployment-and-operations.md)
- [04-security-and-risk.md](04-security-and-risk.md)
- [05-traceability-and-validation.md](05-traceability-and-validation.md)
- [README.md](adr/README.md)
- C4 Level 3 theo phân hệ:
	- [c4-03-order-processing-components.puml](../../charts/c4/c4-03-order-processing-components.puml)
	- [c4-04-shop-builder-components.puml](../../charts/c4/c4-04-shop-builder-components.puml)
	- [c4-05-chat-components.puml](../../charts/c4/c4-05-chat-components.puml)
	- [c4-06-vendor-admin-components.puml](../../charts/c4/c4-06-vendor-admin-components.puml)
- UML bổ trợ:
	- [uml-02-backend-package-diagram.puml](../../charts/uml/uml-02-backend-package-diagram.puml)
	- [uml-07-order-state-machine.puml](../../charts/uml/uml-07-order-state-machine.puml)

## 3. Checklist nộp môn

- [x] I. Tổng quan + FR/NFR
- [x] II. Use Case Diagram + Activity Diagram
- [x] III. Class Diagram + Sequence Diagram
- [x] IV. Kiến trúc + mẫu kiến trúc + design pattern + C4 Level 1, 2
- [x] V. Demo + mã nguồn

## 4. Cập nhật khi mã nguồn thay đổi

1. Cập nhật sơ đồ trong [charts](../../charts).
2. Cập nhật tài liệu liên quan trong `docs/architecture` theo mục I -> V.
3. Nếu thay đổi quyết định kiến trúc, cập nhật bộ ADR trong [adr](adr).
4. Nếu thay đổi kịch bản demo, cập nhật [08-software-evidence-and-demo.md](08-software-evidence-and-demo.md) và [README.md](evidence/README.md).
5. Chạy lại lint/test/build và kiểm tra cú pháp toàn bộ file `.puml`.
