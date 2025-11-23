# Email Sending Solutions Without a Domain

You're currently using **Resend** for email sending, but hit a limitation: custom domains (including Gmail) require verification. Here are your options:

---

## Option 1: Resend Test Domain (✅ Current Fix)
**Status:** Already implemented
**From Address:** `onboarding@resend.dev`
**Setup Time:** Immediate ⚡
**Cost:** Free (100 emails/day)
**Limitations:** 
- Test domain only (not branded)
- Good for MVP/development
- Works for testing password resets now

**✅ Your app is now configured to use this!**

### How to test:
```bash
npm run dev
# Visit http://localhost:3000/auth/forgot-password
# Enter an email address
# Check console for email success confirmation
```

---

## Option 2: Resend with Custom Domain (Recommended Future)
**Status:** When you get a domain
**Setup Time:** 30 minutes
**Cost:** Free (with paid Resend plan for higher limits)

### Steps:
1. Purchase a domain (Vercel Domains, Namecheap, GoDaddy, etc.)
2. Go to https://resend.com/domains
3. Add your domain and verify DNS
4. Update `email.ts`:
   ```typescript
   from: 'noreply@yourdomain.com'
   ```

---

## Option 3: Gmail SMTP (Alternative Now)
**Status:** Can implement now
**Setup Time:** 5 minutes
**Cost:** Free
**Limitations:** ~500 emails/day, less reliable than Resend

### Implementation:
1. Install Nodemailer:
   ```bash
   npm install nodemailer
   ```

2. Update `.env.local`:
   ```bash
   GMAIL_ADDRESS=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-app-specific-password
   # Get app password: https://myaccount.google.com/apppasswords
   ```

3. Create `src/utils/emailGmail.ts`:
   ```typescript
   import nodemailer from 'nodemailer';

   const transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: {
       user: process.env.GMAIL_ADDRESS,
       pass: process.env.GMAIL_APP_PASSWORD,
     },
   });

   export async function sendPasswordResetEmail(
     email: string,
     resetLink: string,
     userName?: string
   ) {
     try {
       await transporter.sendMail({
         from: process.env.GMAIL_ADDRESS,
         to: email,
         subject: 'Reset Your Edwom Online Password',
         html: `...`, // Your HTML template
       });
       return true;
     } catch (error) {
       console.error('Gmail send error:', error);
       return false;
     }
   }
   ```

---

## Option 4: SendGrid (Professional Alternative)
**Status:** Can implement now
**Setup Time:** 10 minutes  
**Cost:** Free tier (100 emails/day)
**Reliability:** ⭐⭐⭐⭐⭐ Professional grade

### Steps:
1. Sign up at https://sendgrid.com
2. Get API key
3. Install: `npm install @sendgrid/mail`
4. Add to `.env.local`:
   ```bash
   SENDGRID_API_KEY=your-key-here
   SENDGRID_FROM_EMAIL=noreply@sendgrid.net
   ```

---

## Option 5: AWS SES (Enterprise)
**Status:** Most professional
**Setup Time:** 30 minutes
**Cost:** Very affordable at scale
**Reliability:** ⭐⭐⭐⭐⭐ Enterprise grade

Best for production with high email volumes.

---

## Current Status ✅

Your app is **working NOW** with Resend test domain!

**You can:**
- ✅ Test password reset flow
- ✅ Send 100 emails/day
- ✅ See reset emails in console

**To upgrade later:**
- Get a domain → Update `from` address → Done!
- Or switch to Gmail/SendGrid by changing email utility

---

## Recommendation

**For now:** Keep Resend test domain (Option 1)
- ✅ Works immediately
- ✅ No extra setup
- ✅ Easy to upgrade later

**When ready to launch:**
- Get a cheap domain (~$2/month on Namecheap)
- Verify with Resend
- Update one line in `email.ts`

---

## Quick Start Test

```bash
# Start dev server
npm run dev

# In browser: http://localhost:3000/auth/forgot-password
# Enter: test@gmail.com (or any email)
# Check terminal output for email confirmation
# You'll see: "✅ Password reset email successfully sent to test@gmail.com"
```

---

**Questions?** Check `/api/auth/forgot-password` in your API routes for email sending logic.
