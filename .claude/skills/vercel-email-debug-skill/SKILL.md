---
name: vercel-email-debug-skill
description: >-
  Debug and fix Vercel deployment issues including email/SMTP failures, environment
  variable problems, and transporter caching issues. Use when email stops working
  after deployment, Vercel builds fail, or environment variables have trailing
  spaces. Keywords: vercel, smtp, email, nodemailer, transporter, env vars,
  deployment, QQ邮箱, 企业邮箱, 腾讯邮件
license: MIT
metadata:
  author: Claude
  version: 1.0.0
  created: 2026-04-17
  last_reviewed: 2026-04-17
  review_interval_days: 90
---

# /vercel-email-debug-skill — Vercel Email Debug & Fix Workflow

You are an expert at debugging Vercel deployment and email/SMTP issues. Your job is to quickly identify and fix common problems.

## Trigger

User invokes `/vercel-email-debug-skill` when:
- Email stops working after Vercel deployment
- SMTP authentication fails but credentials are correct
- Environment variables have trailing spaces
- Vercel GitHub Actions deployment keeps failing
- transporter caching causes persistent SMTP failures

## Common Problems & Solutions

### Problem 1: Email sent but recipient never receives it

**Possible causes:**
1. CONTACT_TO_EMAIL is same as EMAIL_FROM (same address blocked by SMTP server)
2. SMTP credentials are cached with wrong values
3. SMTP_PASS has trailing spaces

**Debug steps:**
```bash
# 1. Check if CONTACT_TO_EMAIL equals EMAIL_FROM
# If yes, change CONTACT_TO_EMAIL to a DIFFERENT address

# 2. Remove cached transporter in email.ts - create fresh transporter each time
# Before: transporter was cached globally
# After: create new transporter on every send

# 3. Use printf instead of echo to avoid trailing spaces in env vars
printf 'password' | vercel env add SMTP_PASS production
# NOT: echo 'password' | vercel env add SMTP_PASS production
```

### Problem 2: SMTP credentials not working

**Common issues:**
1. QQ Enterprise Email requires CLIENT授权密码 (not login password)
2. Authorization code format: 16 characters like `e54gqTGgzSKnCAVg`
3. SMTP_HOST for QQ: `smtp.exmail.qq.com`
4. SMTP_PORT for QQ: `465`

**Fix:**
```bash
# Remove old and re-add with printf to avoid spaces
vercel env rm SMTP_PASS production --yes
printf 'e54gqTGgzSKnCAVg' | vercel env add SMTP_PASS production
```

### Problem 3: GitHub Actions Vercel deployment fails

**Common causes:**
1. VERCEL_TOKEN expired or invalid
2. Project name mismatch (use `--project-name hearty-creation` not `portraitpay`)

**Fix:**
```bash
# Use Vercel CLI directly instead of GitHub Actions
VERCEL_TOKEN="your-token" npx vercel --prod --force

# Or with deploy script:
VERCEL_TOKEN="your-token" ./deploy-vercel.sh
```

### Problem 4: Logo not updating on deployed site

**Causes:**
1. Browser cache
2. Vercel build cache

**Fix:**
```bash
# Force redeploy without cache
npx vercel --prod --force

# Or hard refresh browser: Ctrl+Shift+R
```

## Email.ts Transporter Fix (CRITICAL)

The most common issue: **transporter caching**. When credentials are wrong initially and get cached, they persist even after fixing.

**WRONG (caching):**
```typescript
let _transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (_transporter) return _transporter;  // Returns cached wrong credentials!
  _transporter = nodemailer.createTransport({...});
  return _transporter;
}
```

**CORRECT (no cache):**
```typescript
function createTransporter(): nodemailer.Transporter {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? "465", 10),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendEmail() {
  const transporter = createTransporter();  // Fresh each time!
  // ... send email
}
```

## Vercel Environment Variables Checklist

When debugging email, verify these are set in **Production** environment:

| Variable | Example Value | Required |
|----------|--------------|----------|
| SMTP_HOST | smtp.exmail.qq.com | Yes |
| SMTP_PORT | 465 | Yes |
| SMTP_USER | contact@domain.com | Yes |
| SMTP_PASS | e54gqTGgzSKnCAVg | Yes (no spaces!) |
| EMAIL_FROM | contact@domain.com | Yes |
| CONTACT_TO_EMAIL | hi@domain.com | Yes (MUST be different from EMAIL_FROM) |
| ADMIN_EMAIL | hi@domain.com | Optional |

## QQ Enterprise Email Setup

1. Login to https://exmail.qq.com
2. Admin Panel → Settings → Client Password (客户端密码)
3. Generate new authorization code
4. Use this code as SMTP_PASS (NOT your login password)

## Deployment Workflow

When deploying to Vercel with email functionality:

1. **Set env vars first** with `printf` to avoid spaces:
```bash
printf 'value' | vercel env add VAR_NAME production
```

2. **Deploy with force** to bypass build cache:
```bash
VERCEL_TOKEN="vcp_xxx" npx vercel --prod --force
```

3. **Test email** immediately after deploy:
```bash
curl -X POST "https://your-domain.com/api/contacts" \
  -H "Content-Type: application/json" \
  -d '{"type":"GENERAL","name":"Test","email":"test@test.com","message":"Test message"}'
```

## Quick Diagnosis Commands

```bash
# List all production env vars
vercel env ls production

# Pull production vars locally
vercel env pull .env.production.local

# Check for trailing spaces in values
cat .env.production.local | grep SMTP_PASS | cat -A

# Redeploy without cache
npx vercel --prod --force

# Test contact API
curl -X POST "https://domain.com/api/contacts" \
  -H "Content-Type: application/json" \
  -d '{"type":"GENERAL","name":"Test","email":"test@test.com","message":"Test"}'
```

## Files to Check

1. `src/lib/email.ts` - Transporter caching issue
2. `src/app/api/contacts/route.ts` - Email sending logic
3. Vercel Dashboard → Settings → Environment Variables

## References

See `references/detailed-debug-guide.md` for comprehensive debugging steps.