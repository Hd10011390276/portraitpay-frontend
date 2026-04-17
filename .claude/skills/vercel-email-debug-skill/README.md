# vercel-email-debug-skill

Debug and fix Vercel deployment issues including email/SMTP failures.

## Installation

### Claude Code
```bash
git clone this-repo ~/.claude/skills/vercel-email-debug-skill
```

### Cursor
```bash
git clone this-repo ~/.cursor/rules/vercel-email-debug-skill
```

### GitHub Copilot
```bash
git clone this-repo ~/.github/skills/vercel-email-debug-skill
```

## Usage

```
/vercel-email-debug-skill Email stopped working after Vercel deployment
/vercel-email-debug-skill SMTP authentication failed
/vercel-email-debug-skill QQ enterprise email not working
```

## What It Fixes

- Email sent but recipient never receives (CONTACT_TO_EMAIL same as EMAIL_FROM)
- SMTP credentials cached incorrectly (transporter caching)
- Trailing spaces in environment variables
- Vercel GitHub Actions deployment failures
- Logo not updating after deployment

## Key Lessons Learned

1. **Never cache transporter** - Create fresh Nodemailer transporter on every send
2. **Use printf not echo** - When adding env vars to avoid trailing spaces
3. **Different sender/recipient** - CONTACT_TO_EMAIL must differ from EMAIL_FROM
4. **QQ email requires** - Client authorization code (not login password)
5. **Use Vercel CLI** - Instead of GitHub Actions when issues persist