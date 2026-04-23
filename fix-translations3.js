const fs = require('fs');
const c = fs.readFileSync('C:/Users/Administrator/.openclaw/workspace/portraitpay/src/lib/i18n/translations.ts', 'utf8');
let changed = false;

// Fix zh-CN idCardVerification
if (c.includes('idCardVerification: "身份证认证"')) {
  c = c.replace('idCardVerification: "身份证认证"', 'idCardVerification: "身份文件验证"');
  changed = true;
}
// Fix zh-CN idCardFront
if (c.includes('idCardFront: "身份证正面"')) {
  c = c.replace('idCardFront: "身份证正面"', 'idCardFront: "证件照片"');
  changed = true;
}
// Fix en-US idCardVerification
if (c.includes('idCardVerification: "ID Card Verification"')) {
  c = c.replace('idCardVerification: "ID Card Verification"', 'idCardVerification: "Identity Document Verification"');
  changed = true;
}
// Fix en-US idCardFront
if (c.includes('idCardFront: "ID Card Front"')) {
  c = c.replace('idCardFront: "ID Card Front"', 'idCardFront: "Document Photo"');
  changed = true;
}

if (changed) {
  fs.writeFileSync('C:/Users/Administrator/.openclaw/workspace/portraitpay/src/lib/i18n/translations.ts', c, 'utf8');
  console.log('Done, length:', c.length);
} else {
  console.log('No changes needed, length:', c.length);
}
