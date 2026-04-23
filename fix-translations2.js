const fs = require('fs');
let c = fs.readFileSync('C:/Users/Administrator/.openclaw/workspace/portraitpay/src/lib/i18n/translations.ts', 'utf8');

// Fix zh-CN
c = c.replace(/idCardVerification: "身份证认证"/, 'idCardVerification: "身份文件验证"');
c = c.replace(/idCardFront: "身份证正面"/, 'idCardFront: "证件照片"');
// Fix en-US
c = c.replace(/idCardVerification: "ID Card Verification"/, 'idCardVerification: "Identity Document Verification"');
c = c.replace(/idCardFront: "ID Card Front"/, 'idCardFront: "Document Photo"');

fs.writeFileSync('C:/Users/Administrator/.openclaw/workspace/portraitpay/src/lib/i18n/translations.ts', c, 'utf8');
console.log('Done, length:', c.length);
