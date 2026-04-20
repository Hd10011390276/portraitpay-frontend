with open(r'C:\Users\Administrator\.openclaw\workspace\portraitpay\src\lib\i18n\translations.ts','r',encoding='utf-8') as f:
    content = f.read()

old_zh = '''      deleteAccountDesc: "删除账户将清除所有数据，且无法恢复",
      namePlaceholder: "输入您的显示名称",
      // Wallet binding'''

new_zh = '''      deleteAccountDesc: "删除账户将清除所有数据，且无法恢复",
      deleteAccountBtn: "删除账户",
      namePlaceholder: "输入您的显示名称",
      // Wallet binding'''

old_en = '''      deleteAccountDesc: "Deleting your account will remove all data and cannot be recovered",
      namePlaceholder: "Enter a display name",
      // Wallet binding'''

new_en = '''      deleteAccountDesc: "Deleting your account will remove all data and cannot be recovered",
      deleteAccountBtn: "Delete Account",
      namePlaceholder: "Enter a display name",
      // Wallet binding'''

content = content.replace(old_zh, new_zh, 1)
content = content.replace(old_en, new_en, 1)

with open(r'C:\Users\Administrator\.openclaw\workspace\portraitpay\src\lib\i18n\translations.ts','w',encoding='utf-8') as f:
    f.write(content)

print('done')
