# Vercel Email Debug — Detailed Guide

## Root Cause Analysis: Email Not Received

### Case Study: QQ Enterprise Email

**Problem:** Email API returns `{"success":true}` but recipient never receives email.

**Investigation:**
1. Checked Vercel env vars - all set correctly
2. Checked SMTP credentials - correct
3. Tested API directly - returns success
4. Email still not received

**Root Cause Found:**
1. `EMAIL_FROM` = `contact@portraitpayai.com`
2. `CONTACT_TO_EMAIL` = `contact@portraitpayai.com`
3. **SAME ADDRESS** - SMTP server blocks as spam protection

**Solution:**
- Changed `CONTACT_TO_EMAIL` to `hi@portraitpayai.com` (different from sender)

### Case Study: Transporter Caching

**Problem:** Even after fixing SMTP_PASS, email still fails.

**Investigation:**
1. Verified SMTP_PASS is correct
2. Verified all env vars are correct
3. Email still fails

**Root Cause Found:**
```typescript
// email.ts had cached transporter
let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;  // CACHED!
  _transporter = createTransport({...});
  return _transporter;
}
```

When the first request created transporter with WRONG password, subsequent requests used cached wrong transporter.

**Solution:**
- Removed caching entirely
- Create fresh transporter on every `sendViaSMTP()` call

### Case Study: Trailing Space in Password

**Problem:** SMTP authentication fails even with correct password.

**Investigation:**
```bash
# Added password using echo
echo 'e54gqTGgzSKnCAVg ' | vercel env add SMTP_PASS production
#                    ^ trailing space!
```

**Solution:**
```bash
# Use printf instead - no trailing newline issues
printf 'e54gqTGgzSKnCAVg' | vercel env add SMTP_PASS production
```

## QQ Enterprise Email Specifics

### Getting the Authorization Code

1. Login to https://exmail.qq.com (admin account)
2. Go to: Admin Panel → Settings → 客户端密码
3. If no code exists, generate new one
4. **IMPORTANT:** This is NOT your login password - it's a separate 16-char code

### Correct Configuration for QQ Enterprise Email

```env
SMTP_HOST=smtp.exmail.qq.com
SMTP_PORT=465
SMTP_USER=contact@yourdomain.com
SMTP_PASS=your_16_char_authorization_code
EMAIL_FROM=contact@yourdomain.com
CONTACT_TO_EMAIL=hi@yourdomain.com  # Different from EMAIL_FROM!
```

## Vercel Deployment Issues

### GitHub Actions vs CLI

**GitHub Actions Problem:**
- VERCEL_TOKEN may expire
- Project name mismatch (`portraitpay` vs `hearty-creation`)
- Can't clear Railway Docker cache remotely

**CLI Solution:**
```bash
# Direct Vercel CLI deployment
VERCEL_TOKEN="vcp_xxx" npx vercel --prod --force

# Or use deploy script
VERCEL_TOKEN="vcp_xxx" ./deploy-vercel.sh
```

### Creating a Deploy Script

```bash
#!/bin/bash
# deploy-vercel.sh

if [ -z "$VERCEL_TOKEN" ]; then
    echo "Error: VERCEL_TOKEN not set"
    exit 1
fi

npx vercel --prod --force --token $VERCEL_TOKEN

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
else
    echo "❌ Deployment failed!"
    exit 1
fi
```

## Environment Variable Best Practices

### Adding Env Vars (Avoid Trailing Spaces!)

```bash
# WRONG - may add trailing space or newline
echo 'password' | vercel env add SMTP_PASS production

# CORRECT - printf handles this
printf 'password' | vercel env add SMTP_PASS production

# OR use --yes flag with piped input
printf 'password' | vercel env add SMTP_PASS production --yes
```

### Verifying Env Vars

```bash
# List all production env vars
vercel env ls production

# Pull and check specific var
vercel env pull .env.production.local
cat .env.production.local | grep SMTP_PASS | cat -A
# cat -A shows trailing spaces as ' ' at end of line
```

## Email Flow Debugging

### 1. Check API Response
```bash
curl -X POST "https://domain.com/api/contacts" \
  -H "Content-Type: application/json" \
  -d '{"type":"GENERAL","name":"Test","email":"test@test.com","message":"Test"}'
```

If returns `{"success":true}`, database saved successfully.

### 2. Check if Email Error is Suppressed
In `route.ts`, email errors may be caught but not returned to client:
```typescript
try {
  await sendContactNotification(emailData);
} catch (emailErr) {
  console.error("[Contact] Email send failed:", emailErr);
  // Error NOT returned to client - API still returns success
}
```

### 3. Check Vercel Function Logs
1. Vercel Dashboard → Deployment → Functions
2. Look for error logs in email sending section

### 4. Test SMTP Directly
```typescript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.exmail.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: 'contact@domain.com',
    pass: 'authorization_code'
  }
});

transporter.sendMail({
  from: 'contact@domain.com',
  to: 'hi@domain.com',
  subject: 'Test',
  text: 'Test message'
}, (err, info) => {
  if (err) console.error('SMTP Error:', err);
  else console.log('Sent:', info.messageId);
});
```

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `SMTP credentials not configured` | Missing SMTP_USER/SMTP_PASS | Add to Vercel env vars |
| `Authentication failed` | Wrong password | Re-add with printf |
| `Same address as sender` | CONTACT_TO_EMAIL = EMAIL_FROM | Use different address |
| `Connection timeout` | Wrong SMTP_HOST/PORT | Check QQ email settings |
| `transporter is null` | Cached transporter issue | Remove caching, create fresh |

## Prevention Checklist

- [ ] Use `printf` not `echo` for env var values
- [ ] CONTACT_TO_EMAIL different from EMAIL_FROM
- [ ] Remove transporter caching in email.ts
- [ ] Test email immediately after deployment
- [ ] Check垃圾邮件/junk folder
- [ ] Use Vercel CLI instead of GitHub Actions if issues persist