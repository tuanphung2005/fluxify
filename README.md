---
title: Fluxify
emoji: 💻
colorFrom: purple
colorTo: gray
sdk: docker
pinned: false
---

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/tuanphung2005/fluxify)

## Sơ đồ kiến trúc

Tài liệu kiến trúc được lưu dưới dạng mã nguồn PlantUML tại:

- [charts/index.md](charts/index.md) cho danh mục sơ đồ theo nhóm bắt buộc/bổ trợ
- [charts/c4](charts/c4) cho các góc nhìn kiến trúc kiểu C4
- [charts/uml](charts/uml) cho các sơ đồ UML về cấu trúc và hành vi

## Bộ tài liệu kiến trúc đầy đủ

Bộ tài liệu kiến trúc phần mềm hoàn chỉnh nằm tại:

- [docs/architecture/00-requirement-mapping.md](docs/architecture/00-requirement-mapping.md) để đối chiếu trực tiếp requirement I -> V
- [docs/architecture/README.md](docs/architecture/README.md) cho chỉ mục tổng theo nhóm bắt buộc và bổ trợ
- [docs/architecture/01-system-overview.md](docs/architecture/01-system-overview.md) và [docs/architecture/02-quality-attributes-nfr.md](docs/architecture/02-quality-attributes-nfr.md) cho phần I
- [docs/architecture/07-use-case-specifications.md](docs/architecture/07-use-case-specifications.md) và sơ đồ UML trong [charts/uml](charts/uml) cho phần II, III
- [docs/architecture/06-architecture-and-design-patterns.md](docs/architecture/06-architecture-and-design-patterns.md) và C4 trong [charts/c4](charts/c4) cho phần IV
- [docs/architecture/08-software-evidence-and-demo.md](docs/architecture/08-software-evidence-and-demo.md) và [docs/architecture/evidence/README.md](docs/architecture/evidence/README.md) cho phần V
- [docs/architecture/adr](docs/architecture/adr), [docs/architecture/03-deployment-and-operations.md](docs/architecture/03-deployment-and-operations.md), [docs/architecture/04-security-and-risk.md](docs/architecture/04-security-and-risk.md), [docs/architecture/05-traceability-and-validation.md](docs/architecture/05-traceability-and-validation.md) là bộ hồ sơ bổ trợ

### Thiết lập PlantUML trong không gian làm việc

- Cài tiện ích mở rộng được khuyến nghị: `jebbs.plantuml`.
- Mở bất kỳ file `.puml` và chạy `PlantUML: Preview Current Diagram` từ Command Palette.
- Quá trình dựng hình đang dùng máy chủ PlantUML công khai tại `https://www.plantuml.com/plantuml`.
- Tệp xuất mặc định ở định dạng SVG trong `charts/out`.
