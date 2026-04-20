/**
 * Verification email template
 * Sends a magic link to verify the user's email address
 */

interface VerificationEmailParams {
  name: string;
  email: string;
  verifyUrl: string;
}

export function buildVerificationEmailHtml(params: VerificationEmailParams): { subject: string; html: string; text: string } {
  const { name, email, verifyUrl } = params;
  const timestamp = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
    <div style="background:#7c3aed;padding:20px 24px">
      <h2 style="margin:0;color:#fff;font-size:18px">验证你的邮箱地址</h2>
      <p style="margin:4px 0 0;color:#e9d5ff;font-size:13px">PortraitPay AI · 邮箱验证</p>
    </div>
    <div style="padding:24px">
      <p style="margin:0 0 16px;color:#333;font-size:15px">
        您好 <strong>${name}</strong>，
      </p>
      <p style="margin:0 0 24px;color:#333;font-size:15px">
        感谢你注册 PortraitPay AI！请点击下方按钮验证你的邮箱地址，以激活账户。
      </p>
      <div style="text-align:center;margin:24px 0">
        <a href="${verifyUrl}" style="display:inline-block;padding:14px 36px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px">
          验证邮箱地址
        </a>
      </div>
      <p style="margin:0 0 16px;color:#666;font-size:13px">
        或者复制以下链接到浏览器打开：
      </p>
      <p style="margin:0;color:#7c3aed;font-size:12px;word-break:break-all;background:#f9f9f9;padding:12px;border-radius:6px">
        ${verifyUrl}
      </p>
      <div style="margin-top:24px;padding:16px;background:#f9f9f9;border-radius:8px">
        <p style="margin:0 0 8px;color:#666;font-size:12px">
          <strong>安全提示：</strong>
        </p>
        <ul style="margin:0;padding-left:20px;color:#666;font-size:12px">
          <li>如果你没有注册 PortraitPay AI，请忽略此邮件。</li>
          <li>此链接仅可使用一次，有效期为 <strong>24 小时</strong>。</li>
          <li>请勿将链接告知他人。</li>
        </ul>
      </div>
      <p style="margin:24px 0 0;font-size:12px;color:#999">请求时间：${timestamp}</p>
    </div>
  </div>
</body>
</html>`;

  const text = [
    `PortraitPay AI — 邮箱验证`,
    `============================`,
    ``,
    `您好 ${name}，`,
    ``,
    `感谢你注册 PortraitPay AI！请访问以下链接验证你的邮箱地址（链接有效期 24 小时）：`,
    ``,
    `${verifyUrl}`,
    ``,
    `-------------------------------------------`,
    `安全提示：`,
    `- 如果你没有注册 PortraitPay AI，请忽略此邮件。`,
    `- 此链接仅可使用一次，有效期 24 小时。`,
    `- 请勿将链接告知他人。`,
    ``,
    `请求时间：${timestamp}`,
  ].join("\n");

  return {
    subject: "[PortraitPay AI] 验证你的邮箱地址",
    html,
    text,
  };
}
