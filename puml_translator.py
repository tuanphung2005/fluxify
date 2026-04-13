import os
import glob
import re

def translate_file(path):
    with open(path, 'r', encoding='utf8') as f:
        content = f.read()

    # Base simple replacements (you can add more to dictionary)
    replacements = {
        "title C4 Level 1 - System Context": "title C4 Mức 1 - Ngữ cảnh Hệ thống",
        "actor Customer": "actor Khách_Hàng as Customer",
        "actor Vendor": "actor Người_Bán as Vendor",
        "actor Admin": "actor Quản_Trị_Viên as Admin",
        "actor \"Customer/Vendor/Admin\"": "actor \"Khách Hàng/Người Bán/Quản Trị Viên\"",
        "Cloudinary\\nMedia Storage": "Cloudinary\\nLưu trữ Media",
        "Resend\\nTransactional Email": "Resend\\nEmail Giao dịch",
        "VietQR\\nPayment QR Provider": "VietQR\\nCung cấp Mã QR Thanh toán",
        "Fluxify Platform": "Nền tảng Fluxify",
        "Next.js Web Application": "Ứng dụng Web Next.js",
        "API Route Handlers": "Trình xử lý API (Route Handlers)",
        "HTTPS requests": "Các yêu cầu HTTPS",
        # Add basic C4 titles
        "C4 Level 2 - Container View": "C4 Mức 2 - Khung nhìn Container",
        "Browser": "Trình duyệt Browser",
        "Client State Store": "Lưu trữ Trạng thái Client",
        "App Router UI": "Giao diện App Router"
    }

    for k, v in replacements.items():
        content = content.replace(k, v)

    with open(path, 'w', encoding='utf8') as f:
        f.write(content)

for filepath in glob.glob('charts/**/*.puml', recursive=True):
    translate_file(filepath)
    print(f"Processed {filepath}")
