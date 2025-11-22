# Email Integration Setup Guide

## ✅ Email Service Configured: Resend

Your application is now configured to send password reset emails using **Resend** - a modern, reliable email service.

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Your Resend API Key

1. Go to https://resend.com
2. Click "Sign Up" (free tier available)
3. Verify your email
4. Go to dashboard → "API Keys"
5. Copy the API key

### Step 2: Add to Environment Variables

Update your `.env.local` file:

```bash
# Add this line
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

**Don't have `.env.local`?** Create it in the project root with:
```bash
MONGODB_URI=your_mongodb_url
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Test It!

```bash
npm run dev
# Then go to: http://localhost:3000/auth/forgot-password
```

---

## 📧 Email Features

✅ **Beautiful HTML Email** - Professional design with Edwom branding
✅ **Security Tips** - Educates users about password safety
✅ **15-Min Expiration Notice** - Shows token expiration time
✅ **Button + Link** - Users can click button or copy link
✅ **Responsive Design** - Works on all devices
✅ **Error Handling** - Graceful fallback if email fails

---

## 🔑 Getting Your Resend API Key

### Free Tier Benefits
- ✅ 100 emails/day
- ✅ No credit card required (initially)
- ✅ Full production domain support
- ✅ Easy upgrades when needed

### Steps
1. Visit https://resend.com
2. Click "Get Started"
3. Sign up with email/GitHub
4. Verify email
5. Go to Settings → API Keys
6. Copy "default" API key
7. Paste into `.env.local` as `RESEND_API_KEY`

---

## 📝 Email Template

The email includes:

- **Header** - Edwom Online branding (🛒 logo)
- **Greeting** - Personalized with user's name
- **Main Message** - Clear call-to-action
- **Button** - Click to reset password
- **Link Section** - Fallback link to copy
- **Warning** - 15-minute expiration notice
- **Security Tips** - Best practices
- **Footer** - Support links and copyright

---

## ✅ Testing the Email

### Local Testing (Without Real Email)

If you don't have an API key yet, the system still works:
1. Password reset flow functions normally
2. Email is not sent (but logged to console)
3. Console shows the reset link
4. Copy link from console to browser

**Console Output Example:**
```
📧 Password Reset Link (for testing):
http://localhost:3000/auth/reset-password?token=eyJhbGc...
```

### With Real Email (After Adding API Key)

1. Add `RESEND_API_KEY` to `.env.local`
2. Restart dev server: `npm run dev`
3. Go to http://localhost:3000/auth/forgot-password
4. Enter your email
5. **Check your inbox** (or spam folder)
6. Click the reset link in the email
7. Reset password successfully ✅

---

## 🔄 Email Workflow

```
User requests password reset
        ↓
API generates JWT token (15 min expiry)
        ↓
Token saved to MongoDB
        ↓
sendPasswordResetEmail() called
        ↓
Resend API sends HTML email
        ↓
User receives email
        ↓
User clicks link: /auth/reset-password?token=xxx
        ↓
Token validated
        ↓
User enters new password
        ↓
Password reset successful ✅
```

---

## 🎯 Current Status

| Component | Status |
|-----------|--------|
| Email Utility | ✅ Created |
| Password Reset Flow | ✅ Works |
| Resend Integration | ✅ Configured |
| API Key | ⏳ Needs setup |
| Email Sending | ⏳ Ready (waiting for key) |

---

## ⚙️ Configuration Files

### Modified Files
- `src/app/api/auth/forgot-password/route.ts` - Now calls sendPasswordResetEmail()

### New Files
- `src/utils/email.ts` - Email sending utility

### Environment Variables Needed
- `RESEND_API_KEY` - From Resend dashboard

---

## 🐛 Troubleshooting

### Email Not Received?

**Check 1: Do you have RESEND_API_KEY?**
- Go to `.env.local`
- Look for `RESEND_API_KEY=re_xxx`
- If missing, get one from https://resend.com

**Check 2: Restart dev server**
```bash
# Stop: Ctrl+C
# Start:
npm run dev
```

**Check 3: Check spam folder**
- Resend emails sometimes go to spam
- Add `noreply@edwom.com` to contacts

**Check 4: Check console for errors**
- Look for error messages in terminal
- Copy full error message if present

**Check 4: Test with Resend Dashboard**
- Go to https://resend.com/emails
- See all emails sent
- Check delivery status
- View any error messages

### API Key Invalid?

Error: `"API token is invalid"`

**Solution:**
1. Go to https://resend.com/api-keys
2. Copy the full API key (starts with `re_`)
3. Paste into `.env.local` (remove any extra spaces)
4. Restart dev server

### Development Domain Warning?

First time using Resend on development domain, you might get a warning.

**Solution:**
- Just confirm domain setup in Resend dashboard
- Or upgrade to production domain
- Works fine on development for testing

---

## 🚀 Production Deployment

### On Vercel

1. **Add environment variable to Vercel:**
   - Go to Vercel Project Settings
   - Environment Variables
   - Add: `RESEND_API_KEY=re_xxx`

2. **Deploy:**
   ```bash
   git push
   # Vercel auto-deploys
   ```

3. **Test on staging:**
   - Go to your staging URL
   - Test forgot password
   - Check email arrives

### On Other Platforms

Same process:
1. Add `RESEND_API_KEY` to environment variables
2. Deploy
3. Test email sending

---

## 💡 Pro Tips

### Debugging Email Issues

Add temporary logging to see what's happening:

```typescript
// In src/utils/email.ts, add:
console.log('📧 Sending email to:', email);
console.log('📧 Reset link:', resetLink);
```

Then watch console when user requests reset.

### Testing Different Emails

Test password reset with different email formats:
- Your own email
- Gmail account
- Work email
- Different email service

All should receive the email (if RESEND_API_KEY is set).

---

## 📊 Email Sending Limits

| Plan | Limit | Cost |
|------|-------|------|
| **Free** | 100/day | Free |
| **Starter** | 1000/day | $20/month |
| **Pro** | Custom | Custom |

For most projects, free tier is plenty!

---

## 🔐 Security Notes

✅ **API Key Security**
- Never commit `.env.local` to git
- Never share API key publicly
- Use different keys for dev/production
- Rotate keys regularly in production

✅ **Email Content**
- Password reset link expires in 15 minutes
- Token is JWT signed with NEXTAUTH_SECRET
- Cannot be forged or tampered with
- Single-use validation in database

---

## 📞 Support

### Resend Support
- Docs: https://resend.com/docs
- Status: https://resend.com/status
- Email: support@resend.com

### For Local Development
- Don't have API key yet? No problem!
- Link still appears in console
- Copy and paste it in browser
- Full functionality works

---

## ✨ Next Steps

1. **Get API Key** (3 minutes)
   - Visit https://resend.com
   - Sign up (free)
   - Copy API key

2. **Add to .env.local** (30 seconds)
   ```bash
   RESEND_API_KEY=re_xxx
   ```

3. **Restart dev server** (1 minute)
   ```bash
   npm run dev
   ```

4. **Test email** (2 minutes)
   - Go to forgot-password page
   - Enter your email
   - Check inbox!

**Total Setup Time: ~10 minutes**

---

## 🎉 You're All Set!

Email sending is now configured and ready to go. Just add your API key and restart!

Questions? Check Resend docs: https://resend.com/docs
