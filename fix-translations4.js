const fs = require('fs');
let c = fs.readFileSync('C:/Users/Administrator/.openclaw/workspace/portraitpay/src/lib/i18n/translations.ts', 'utf8');
c = c.replace(/idCardVerification: "身份证认证"/g, 'idCardVerification: "身份文件验证"');
c = c.replace(/idCardFront: "身份证正面"/g, 'idCardFront: "证件照片"');
c = c.replace(/idCardVerification: "ID Card Verification"/g, 'idCardVerification: "Identity Document Verification"');
c = c.replace(/idCardFront: "ID Card Front"/g, 'idCardFront: "Document Photo"');
fs.writeFileSync('C:/Users/Administrator/.openclaw/workspace/portraitpay/src/lib/i18n/translations.ts', c, 'utf8');
console.log('OK, length:', c.length);
