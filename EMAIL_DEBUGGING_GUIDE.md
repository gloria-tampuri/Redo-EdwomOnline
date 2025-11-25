# Email Debugging Guide - Password Reset Not Sending

## 🔍 Let's Debug This!

You've added the Resend API key but emails aren't arriving. Let's fix it step by step.

---

## ✅ What I Fixed

### 1. **Updated Email "From" Address**
- ❌ Was: `noreply@edwom.com` (custom domain - requires verification)
- ✅ Now: `onboarding@resend.dev` (Resend's test domain - works immediately)

### 2. **Enhanced Error Logging**
- Added detailed error messages in console
- Better debugging information
- Full error stack traces

### 3. **Improved Email Sending Confirmation**
- Logs when email is sent successfully
- Shows Resend response data

---

## 🧪 How to Test Now

### Step 1: Restart Dev Server

Stop the current server and restart:
```bash
# Press Ctrl+C in terminal to stop
# Then run:
npm run dev
```

### Step 2: Go to Forgot Password
```
http://localhost:3000/auth/forgot-password
```

### Step 3: Enter Your Email

Use **your actual email address**:
```
gloria.tampuri@gmail.com
```

### Step 4: Watch the Console

**Look for ONE of these messages:**

**Success (Good!):**
```
✅ Password reset email sent to gloria.tampuri@gmail.com
📧 Email response: { id: 're_xxxx', from: 'onboarding@resend.dev', ... }
```

**Error (We need to see this):**
```
❌ Error sending password reset email to gloria.tampuri@gmail.com
Error message: [specific error]
Full error: {...}
```

---

## 📋 Checklist Before Testing

- [ ] `.env.local` has `RESEND_API_KEY=re_BJJf5kxE_...`
- [ ] Dev server restarted (`npm run dev`)
- [ ] Using correct email address
- [ ] Checking console output (not just browser)
- [ ] Checking spam/promotions folder

---

## ❌ Possible Issues & Fixes

### Issue 1: "Invalid API Key"

**Error Message:**
```
API token is invalid
```

**Causes:**
- Typo in API key
- Extra spaces before/after key
- Wrong key copied

**Fix:**
```bash
# Check .env.local
# Make sure it looks like:
RESEND_API_KEY=re_BJJf5kxE_538ScH76fJehkYEDJvaSpgsU

# No spaces, starts with 're_'
```

### Issue 2: "Invalid From Address"

**Error Message:**
```
You are not allowed to send emails from noreply@edwom.com
```

**Cause:**
- Using custom domain before verification
- (This should be fixed now - using onboarding@resend.dev)

**Fix:**
- Already done! ✅ Using `onboarding@resend.dev` now

### Issue 3: "Invalid Email Address"

**Error Message:**
```
Invalid email address: [your email]
```

**Cause:**
- Email address is malformed
- Contains invalid characters

**Fix:**
- Use valid email: `gloria.tampuri@gmail.com` ✅

### Issue 4: "Rate Limit Exceeded"

**Error Message:**
```
Rate limit exceeded
```

**Cause:**
- Too many email sends in short time

**Fix:**
- Wait a few minutes and try again
- Use different email address

---

## 🔍 Step-by-Step Debugging

### Debug Step 1: Check API Key in Console

In browser DevTools console, open Network tab:
1. Go to `/auth/forgot-password`
2. Open DevTools (F12)
3. Go to Network tab
4. Submit the form
5. Look for `forgot-password` request
6. Check response for errors

### Debug Step 2: Check Server Console

In VS Code terminal where you run `npm run dev`:
1. Submit password reset form
2. Look for these logs:

```
📧 Password Reset Link (for testing):
http://localhost:3000/auth/reset-password?token=...

✅ Password reset email sent to gloria.tampuri@gmail.com
📧 Email response: {...}
```

Or if error:
```
❌ Error sending password reset email to gloria.tampuri@gmail.com
Error message: [detailed message]
```

### Debug Step 3: Test with Resend Dashboard

1. Go to https://resend.com/emails
2. Sign in with your account
3. Look for emails in the dashboard
4. Check status: Delivered, Bounced, or Pending
5. See exact error message if failed

---

## 📧 Expected Email From Address

The email should come from:
- **From:** `onboarding@resend.dev`
- **Subject:** `Reset Your Edwom Online Password`
- **Content:** Beautiful HTML template with button and link

If you see it came from a different address or different subject, email didn't send.

---

## ✅ Success Indicators

When email is working, you should see:

**In Console:**
```
✅ Password reset email sent to gloria.tampuri@gmail.com
📧 Email response: { id: 're_...', from: 'onboarding@resend.dev', to: 'gloria.tampuri@gmail.com', ... }
```

**In Email Inbox:**
- Email arrives within 1-2 minutes
- From: onboarding@resend.dev
- Subject: Reset Your Edwom Online Password
- Contains reset button + link

**In Resend Dashboard:**
- Email shows as "Delivered"
- Status is green ✅

---

## 📞 Common Questions

### Q: Where are the emails I sent?
**A:** Check https://resend.com/emails when logged into your Resend account

### Q: Email still not arriving?
**A:** Check spam/promotions folder - sometimes arrives there first

### Q: How long should I wait?
**A:** Usually 1-2 minutes. If longer than 5 min, something is wrong

### Q: Can I use my custom domain?
**A:** Yes, but needs verification in Resend dashboard first. For now use `onboarding@resend.dev` ✅

### Q: What if I see error in console?
**A:** Copy the full error message and check the sections above

---

## 🚀 Next Steps

1. **Restart dev server** - Most common fix!
   ```bash
   npm run dev
   ```

2. **Test email sending**
   - Go to forgot-password page
   - Enter your email
   - Watch console

3. **Share console output**
   - If error, copy exact error message
   - Will help debug further

4. **Check Resend dashboard**
   - https://resend.com/emails
   - See all emails sent
   - Check delivery status

---

## 🎯 What Changed

| What | Before | After |
|------|--------|-------|
| From Address | noreply@edwom.com | onboarding@resend.dev ✅ |
| Error Logging | Minimal | Detailed ✅ |
| Debug Info | Limited | Complete ✅ |
| Build Status | ✓ | ✓ |

---

## 📝 Test Email Flow

```
1. User goes to /auth/forgot-password
          ↓
2. Enters email: gloria.tampuri@gmail.com
          ↓
3. Clicks "Send Reset Link"
          ↓
4. API generates JWT token
          ↓
5. Token saved to MongoDB
          ↓
6. sendPasswordResetEmail() called
          ↓
7. Resend API sends email
          ↓
Console shows:
✅ Password reset email sent to gloria.tampuri@gmail.com
          ↓
8. User receives email in inbox
          ↓
9. User clicks link in email
          ↓
10. Password reset complete ✅
```

---

## 🔧 Manual Testing without UI

Using PowerShell:
```powershell
$body = @{ email = "gloria.tampuri@gmail.com" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/forgot-password" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

Then check console for success/error messages.

---

## 📞 If Still Not Working

Please share:
1. **Error message from console** - Copy exact text
2. **API key status** - Is it in .env.local?
3. **Dev server output** - Full console logs
4. **Resend dashboard** - Do you see emails attempted?

---

## ✨ Summary

✅ Code updated to use working Resend domain  
✅ Error logging enhanced  
✅ Build successful  
⏳ Ready to test - **Restart dev server first!**

**Next Action:** Stop and restart `npm run dev`, then test password reset!
