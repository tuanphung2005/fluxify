const fs = require('fs');
const path = require('path');

const legendReplacements = [
    { old: '|= Marker |= Meaning |', new: '|= Ký hiệu |= Ý nghĩa |' },
    { old: '|<#E0F2FE>System|Platform or system boundary|', new: '|<#E0F2FE>Hệ thống|Nền tảng hoặc ranh giới hệ thống|' },
    { old: '|<#DCFCE7>Frontend|UI or client-facing component|', new: '|<#DCFCE7>Frontend|Giao diện người dùng hoặc component phía client|' },
    { old: '|<#DBEAFE>Backend|API, service, or business logic component|', new: '|<#DBEAFE>Backend|API, dịch vụ, hoặc logic nghiệp vụ|' },
    { old: '|<#E2E8F0>Data|Database or persistence element|', new: '|<#E2E8F0>Dữ liệu|Cơ sở dữ liệu hoặc thành phần lưu trữ|' },
    { old: '|<#F1F5F9>External|Third-party integration or external system|', new: '|<#F1F5F9>Ngoài|Tích hợp bên thứ 3 hoặc hệ thống bên ngoài|' },
    { old: '|<#FEE2E2>Security|Authentication, authorization, or guard component|', new: '|<#FEE2E2>Bảo mật|Xác thực, phân quyền, hoặc rào cản bảo mật|' },
    { old: `' Shared PlantUML visual theme for Fluxify architecture diagrams.`, new: `' Theme PlantUML dùng chung cho các sơ đồ kiến trúc Fluxify.` }
];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let oldContent = content;
    legendReplacements.forEach(r => {
        content = content.replace(r.old, r.new);
    });
    if (content !== oldContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Replaced common strings in:', filePath);
    }
}

['charts/c4', 'charts/uml'].forEach(dir => {
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
            if (file.endsWith('.puml')) {
                replaceInFile(path.join(dir, file));
            }
        });
    }
});
