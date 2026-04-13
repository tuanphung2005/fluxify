$dirs = @('charts/c4', 'charts/uml')

$replacements = @{
    'title C4 Level 1 - System Context' = 'title C4 Mức 1 - Ngữ cảnh Hệ thống'
    'title C4 Level 2 - Container View' = 'title C4 Mức 2 - Khung nhìn Container'
    'title C4 Level 3 - Chat and Unread Components' = 'title C4 Mức 3 - Component Chat và Tin nhắn chưa đọc'
    'title Fluxify UML - Domain Class Model' = 'title Sơ đồ Lớp Domain (Domain Class Model)'
    'title Fluxify UML - Backend Package Diagram' = 'title Sơ đồ Package Backend (Backend Package Diagram)'
    'title Fluxify UML - Checkout and Payment Sequence' = 'title Sơ đồ Tuần tự Thanh toán và Checkout'
    'title Fluxify UML - Vendor Order Management Sequence' = 'title Sơ đồ Tuần tự Quản lý Đơn hàng của Vendor'
    'title Fluxify UML - Registration, Verification, and Login Sequence' = 'title Sơ đồ Tuần tự Đăng ký, Xác thực và Đăng nhập'
    'title Fluxify UML - Product Lifecycle Activity' = 'title Sơ đồ Hoạt động Vòng đời Sản phẩm'
    'title Fluxify UML - Order State Machine' = 'title Sơ đồ Trạng thái Đơn hàng'
    'title Fluxify UML - Shop Template Lifecycle Activity' = 'title Sơ đồ Hoạt động Vòng đời Mẫu cửa hàng (Shop Template)'
    'actor Customer' = 'actor "Khách Hàng" as Customer'
    'actor Vendor' = 'actor "Người Bán" as Vendor'
    'actor Admin' = 'actor "Quản Trị Viên" as Admin'
    'left to right direction' = 'left to right direction'
}

foreach ($dir in $dirs) {
    if (Test-Path $dir) {
        $files = Get-ChildItem -Path $dir -Filter *.puml
        foreach ($file in $files) {
            $content = Get-Content $file.FullName -Raw
            $changed = $false
            foreach ($key in $replacements.Keys) {
                if ($content -match [regex]::Escape($key)) {
                    $content = $content -replace [regex]::Escape($key), $replacements[$key]
                    $changed = $true
                }
            }
            if ($changed) {
                Set-Content -Path $file.FullName -Value $content -Encoding UTF8
                Write-Host "Updated $($file.Name)"
            }
        }
    }
}
