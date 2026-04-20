const fs = require('fs');
let content = fs.readFileSync('C:\\Users\\Administrator\\.openclaw\\workspace\\portraitpay\\src\\lib\\i18n\\translations.ts', 'utf8');

const oldZh = `      deleteAccountDesc: "删除账户将清除所有数据，且无法恢复",
      namePlaceholder: "输入您的显示名称",
      // Wallet binding`;

const newZh = `      deleteAccountDesc: "删除账户将清除所有数据，且无法恢复",
      deleteAccountBtn: "删除账户",
      namePlaceholder: "输入您的显示名称",
      // Wallet binding`;

const oldEn = `      deleteAccountDesc: "Deleting your account will remove all data and cannot be recovered",
      namePlaceholder: "Enter a display name",
      // Wallet binding`;

const newEn = `      deleteAccountDesc: "Deleting your account will remove all data and cannot be recovered",
      deleteAccountBtn: "Delete Account",
      namePlaceholder: "Enter a display name",
      // Wallet binding`;

content = content.replace(oldZh, newZh);
content = content.replace(oldEn, newEn);

fs.writeFileSync('C:\\Users\\Administrator\\.openclaw\\workspace\\portraitpay\\src\\lib\\i18n\\translations.ts', content, 'utf8');
console.log('done');
