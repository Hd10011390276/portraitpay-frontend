const fs = require('fs');
let content = fs.readFileSync('C:/Users/Administrator/.openclaw/workspace/portraitpay/src/lib/i18n/translations.ts', 'utf8');

// Fix zh-CN idCardVerification
content = content.replace(/idCardVerification: "身份证认证"/, 'idCardVerification: "身份文件验证"');
// Fix zh-CN idCardFront
content = content.replace(/idCardFront: "身份证正面"/, 'idCardFront: "证件照片"');
// Fix en-US idCardVerification
content = content.replace(/idCardVerification: "ID Card Verification"/, 'idCardVerification: "Identity Document Verification"');
// Fix en-US idCardFront
content = content.replace(/idCardFront: "ID Card Front"/, 'idCardFront: "Document Photo"');

// Remove duplicate idCardTip line in zh-CN (keep first, remove duplicate)
content = content.replace(/(idCardTip: "上传身份证、护照.*?)\n      idCardTip:/gs, '$1');

fs.writeFileSync('C:/Users/Administrator/.openclaw/workspace/portraitpay/src/lib/i18n/translations.ts', content, 'utf8');
console.log('Done, length:', content.length);
