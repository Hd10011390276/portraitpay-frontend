const fs = require('fs');
const c = fs.readFileSync('C:\\Users\\Administrator\\.openclaw\\workspace\\portraitpay\\src\\lib\\i18n\\translations.ts','utf8');
const keys = ['save','settingsSaved','saved','settingsSavedError','accountInfo','emailAddress','displayName','notificationSettings','emailNotifications','emailNotificationsDesc','infringementAlerts','infringementAlertsDesc','marketingEmails','marketingEmailsDesc','saveSettings','saving','dangerZone','deleteAccount','deleteAccountConfirm','deleteAccountError','deleteAccountDesc','deleteAccountBtn','namePlaceholder'];
keys.forEach(k => {
  const re = new RegExp(k + ':');
  if (!re.test(c)) {
    console.log(k + ': MISSING');
  } else {
    console.log(k + ': present');
  }
});
