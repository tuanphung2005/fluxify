# 00. Đối chiếu Requirement Bài tập lớn

Tài liệu này dùng để đối chiếu trực tiếp yêu cầu đề bài với các artifact hiện có trong `charts` và tài liệu kiến trúc.

Nguyên tắc chuẩn hóa đã chốt:
- Giữ đầy đủ nội dung bắt buộc theo đề.
- Giữ nội dung bổ trợ nếu giúp giải thích rõ hơn và không mâu thuẫn với đề.
- Xóa nội dung trùng/lệch mục đích rõ ràng.

## 1. Yêu cầu gốc của đề bài

1. Tổng quan và giới thiệu: mô tả sản phẩm, mục đích, yêu cầu chức năng và phi chức năng.
2. Đặc tả và mô hình hóa yêu cầu: Use Case Diagram, Activity Diagram.
3. Cấu trúc và hành vi: Class Diagram, Sequence Diagram.
4. Kiến trúc và mẫu thiết kế: kiểu kiến trúc, mẫu kiến trúc, design pattern; C4 Level 1 và Level 2.
5. Minh chứng phần mềm: demo sản phẩm và mã nguồn.

## 2. Ma trận đối chiếu I -> V

| Mục đề bài | Trạng thái | Artifact bắt buộc (đã có) | Artifact bổ trợ (đã giữ) |
|---|---|---|---|
| I. Tổng quan và giới thiệu | Đã có | [01-system-overview.md](01-system-overview.md), [02-quality-attributes-nfr.md](02-quality-attributes-nfr.md) | [05-traceability-and-validation.md](05-traceability-and-validation.md), [04-security-and-risk.md](04-security-and-risk.md) |
| II. Đặc tả và mô hình hóa yêu cầu | Đã có | [uml-00-system-usecase-diagram.puml](../../charts/uml/uml-00-system-usecase-diagram.puml), [uml-06-product-lifecycle-activity.puml](../../charts/uml/uml-06-product-lifecycle-activity.puml), [uml-08-shop-template-lifecycle-activity.puml](../../charts/uml/uml-08-shop-template-lifecycle-activity.puml), [uml-09-checkout-activity.puml](../../charts/uml/uml-09-checkout-activity.puml), [07-use-case-specifications.md](07-use-case-specifications.md) | Khai triển nhiều activity theo các luồng khác nhau |
| III. Cấu trúc và hành vi | Đã có | [uml-01-domain-class-model.puml](../../charts/uml/uml-01-domain-class-model.puml), [uml-03-checkout-sequence.puml](../../charts/uml/uml-03-checkout-sequence.puml), [uml-04-vendor-operations-sequence.puml](../../charts/uml/uml-04-vendor-operations-sequence.puml), [uml-05-auth-registration-sequence.puml](../../charts/uml/uml-05-auth-registration-sequence.puml) | [uml-02-backend-package-diagram.puml](../../charts/uml/uml-02-backend-package-diagram.puml), [uml-07-order-state-machine.puml](../../charts/uml/uml-07-order-state-machine.puml) |
| IV. Kiến trúc và mẫu thiết kế | Đã có | [06-architecture-and-design-patterns.md](06-architecture-and-design-patterns.md), [c4-01-system-context.puml](../../charts/c4/c4-01-system-context.puml), [c4-02-container-view.puml](../../charts/c4/c4-02-container-view.puml) | [c4-03-order-processing-components.puml](../../charts/c4/c4-03-order-processing-components.puml), [c4-04-shop-builder-components.puml](../../charts/c4/c4-04-shop-builder-components.puml), [c4-05-chat-components.puml](../../charts/c4/c4-05-chat-components.puml), [c4-06-vendor-admin-components.puml](../../charts/c4/c4-06-vendor-admin-components.puml), bộ ADR |
| V. Minh chứng phần mềm | Đã có | [08-software-evidence-and-demo.md](08-software-evidence-and-demo.md), [README.md](evidence/README.md), [README.md](../../README.md) | [05-traceability-and-validation.md](05-traceability-and-validation.md), thư mục [tests](../../tests) |

## 3. Danh mục sơ đồ theo mức ưu tiên

### Nhóm bắt buộc theo đề
- Use Case Diagram: [uml-00-system-usecase-diagram.puml](../../charts/uml/uml-00-system-usecase-diagram.puml)
- Activity Diagram: [uml-06-product-lifecycle-activity.puml](../../charts/uml/uml-06-product-lifecycle-activity.puml), [uml-08-shop-template-lifecycle-activity.puml](../../charts/uml/uml-08-shop-template-lifecycle-activity.puml), [uml-09-checkout-activity.puml](../../charts/uml/uml-09-checkout-activity.puml)
- Class Diagram: [uml-01-domain-class-model.puml](../../charts/uml/uml-01-domain-class-model.puml)
- Sequence Diagram: [uml-03-checkout-sequence.puml](../../charts/uml/uml-03-checkout-sequence.puml), [uml-04-vendor-operations-sequence.puml](../../charts/uml/uml-04-vendor-operations-sequence.puml), [uml-05-auth-registration-sequence.puml](../../charts/uml/uml-05-auth-registration-sequence.puml)
- C4 bắt buộc: [c4-01-system-context.puml](../../charts/c4/c4-01-system-context.puml), [c4-02-container-view.puml](../../charts/c4/c4-02-container-view.puml)

### Nhóm bổ trợ đang giữ
- C4 Level 3 theo phân hệ: [c4-03-order-processing-components.puml](../../charts/c4/c4-03-order-processing-components.puml), [c4-04-shop-builder-components.puml](../../charts/c4/c4-04-shop-builder-components.puml), [c4-05-chat-components.puml](../../charts/c4/c4-05-chat-components.puml), [c4-06-vendor-admin-components.puml](../../charts/c4/c4-06-vendor-admin-components.puml)
- UML bổ trợ: [uml-02-backend-package-diagram.puml](../../charts/uml/uml-02-backend-package-diagram.puml), [uml-07-order-state-machine.puml](../../charts/uml/uml-07-order-state-machine.puml)

## 4. Danh mục tài liệu theo mức ưu tiên

### Nhóm bắt buộc theo đề
- [01-system-overview.md](01-system-overview.md)
- [02-quality-attributes-nfr.md](02-quality-attributes-nfr.md)
- [06-architecture-and-design-patterns.md](06-architecture-and-design-patterns.md)
- [07-use-case-specifications.md](07-use-case-specifications.md)
- [08-software-evidence-and-demo.md](08-software-evidence-and-demo.md)

### Nhóm bổ trợ đang giữ
- [03-deployment-and-operations.md](03-deployment-and-operations.md)
- [04-security-and-risk.md](04-security-and-risk.md)
- [05-traceability-and-validation.md](05-traceability-and-validation.md)
- [README.md](adr/README.md) và bộ ADR
- [README.md](evidence/README.md)

## 5. Hạng mục đã dọn

- Đã loại bỏ file trùng/lệch vai trò trong charts shared: `charts/shared/temp.puml`.

## 6. Checklist kiểm tra nhanh trước khi nộp

- I: Có tổng quan, mục tiêu, FR và NFR.
- II: Có Use Case Diagram và Activity Diagram.
- III: Có Class Diagram và Sequence Diagram.
- IV: Có kiến trúc + mẫu kiến trúc + design pattern + C4 Level 1, 2.
- V: Có kịch bản demo và ánh xạ mã nguồn minh chứng.