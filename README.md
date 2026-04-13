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

- `charts/index.md` cho danh mục sơ đồ và ghi chú sử dụng
- `charts/c4` cho các góc nhìn kiến trúc kiểu C4
- `charts/uml` cho các sơ đồ UML về cấu trúc và hành vi

## Bộ tài liệu kiến trúc đầy đủ

Bộ tài liệu kiến trúc phần mềm hoàn chỉnh nằm tại:

- `docs/architecture/README.md` cho trang chỉ mục tổng
- `docs/architecture/01-system-overview.md` cho phạm vi, bên liên quan và động lực kiến trúc
- `docs/architecture/02-quality-attributes-nfr.md` cho NFR có thể đo lường
- `docs/architecture/03-deployment-and-operations.md` cho góc nhìn triển khai và vận hành
- `docs/architecture/04-security-and-risk.md` cho kiểm soát bảo mật và sổ đăng ký rủi ro
- `docs/architecture/adr/` cho các hồ sơ quyết định kiến trúc (ADR)
- `docs/architecture/05-traceability-and-validation.md` cho ma trận truy vết và kế hoạch kiểm chứng

### Thiết lập PlantUML trong không gian làm việc

- Cài tiện ích mở rộng được khuyến nghị: `jebbs.plantuml`.
- Mở bất kỳ file `.puml` và chạy `PlantUML: Preview Current Diagram` từ Command Palette.
- Quá trình dựng hình đang dùng máy chủ PlantUML công khai tại `https://www.plantuml.com/plantuml`.
- Tệp xuất mặc định ở định dạng SVG trong `charts/out`.
