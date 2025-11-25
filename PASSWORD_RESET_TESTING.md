# Quick Start: Testing Password Reset

## 1. Start Development Server

```bash
npm run dev
```

Expected output:
```
  ▲ Next.js 16.0.3
  - Local:        http://localhost:3000
```

---

## 2. Test Forgot Password Page

### Access the Page
- Open browser: http://localhost:3000/auth/forgot-password
- You should see:
  - "Forgot Password?" heading
  - Description text
  - Email input field
  - "Send Reset Link" button
  - "Sign in" link at bottom

### Test Form Validation
- Try submitting empty email → Should show "Email is required"
- Enter invalid email like "notanemail" → Should show "Please enter a valid email address"
- Enter valid email → Should allow submission

### Test Forgot Password Mutation
- Enter a registered email (e.g., `admin@edwom.com`)
- Click "Send Reset Link"
- Watch the console output (VS Code terminal)

**Expected Console Output:**
```
📧 Password Reset Link (copy to browser):
http://localhost:3000/auth/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- You should see a green success message: "✅ If an account exists for this email, a reset link has been sent."
- Success message disappears after 5 seconds

### Test Rate Limiting
- Try requesting 4 times within 15 minutes
- 4th request should show error: "Too many reset requests. Please try again later."
- Message will change from green success to red error

---

## 3. Test Reset Password Page

### Access the Page via Console Link
- Copy the reset link from console in step 2
- Paste into browser address bar
- Example: `http://localhost:3000/auth/reset-password?token=eyJhbGc...`

### Verify Token Valid
- Should show:
  - Loading spinner briefly
  - "Set New Password" heading
  - Email address displayed
  - "New Password" input
  - "Confirm Password" input
  - "Reset Password" button
  - "Back to Sign In" link

### Test Password Visibility Toggle
- Click eye icon (👁️) next to "New Password" field
- Password should become visible text
- Click again (🙈) to hide
- Same for "Confirm Password" field

### Test Form Validation
- Try password less than 6 chars: "12345" → Error: "Password must be at least 6 characters"
- Try passwords that don't match:
  - New Password: `MyNewPass123`
  - Confirm: `MyNewPass456`
  - Should show: "Passwords do not match"

### Test Successful Password Reset
- Enter valid passwords:
  - New Password: `NewPassword123`
  - Confirm: `NewPassword123`
- Click "Reset Password"
- Should see success message:
  - ✅ checkmark
  - "Password Reset Successful!"
  - "Your password has been updated. Redirecting to login..."
  - Auto-redirects to login page after 2 seconds

---

## 4. Test Token Expiration

### Expire a Token
- Request reset password link
- Copy the token
- **Wait 16 minutes** (token expires after 15 minutes)
- Paste link into browser

### Expected Behavior
- Should show error page:
  - "Reset Link Expired"
  - Error message: "This reset link has expired or is invalid."
  - Link to "Request a new reset link"

---

## 5. Test Login with New Password

### After Successful Reset
- You should be redirected to `/auth/login` automatically
- Or click "Back to Sign In"

### Sign In with New Password
- Email: (the email you just reset)
- Password: (the NEW password you just set, e.g., `NewPassword123`)
- Click "Sign In"
- Should successfully log in and redirect to home page

### Verify Old Password Doesn't Work
- Log out
- Try signing in with the old password
- Should fail with "Invalid credentials"

---

## 6. Test Invalid Token

### Test Non-existent Token
- Go to: `http://localhost:3000/auth/reset-password?token=invalid_token_here`
- Should show error: "Invalid or expired reset token"

### Test Malformed Token
- Go to: `http://localhost:3000/auth/reset-password?token=notajwt`
- Should show error: "Invalid reset token"

### Test Missing Token
- Go to: `http://localhost:3000/auth/reset-password` (no ?token parameter)
- Should show: "This password reset link is invalid."

---

## 7. Test API Endpoints Directly (Using cURL)

### Test Forgot Password Endpoint
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Expected response:
```json
{
  "success": true,
  "message": "If an account exists for this email, a reset link has been sent."
}
```

### Test Verify Token Endpoint
```bash
# Replace TOKEN with the actual token from console
curl http://localhost:3000/api/auth/verify-reset-token?token=TOKEN
```

Expected response (valid token):
```json
{
  "success": true,
  "email": "admin@edwom.com"
}
```

Expected response (invalid/expired):
```json
{
  "error": "Reset link has expired. Please request a new one."
}
```

### Test Reset Password Endpoint
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_HERE","newPassword":"NewPass123"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

---

## 8. Test React Query Integration

### Open React Query DevTools (Optional)
Install devtools:
```bash
npm install @tanstack/react-query-devtools
```

Update `src/app/QueryProvider.tsx`:
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Debug in Browser
- Float window in bottom right shows React Query queries/mutations
- Shows loading states, data, errors
- Useful for debugging

---

## 9. Test Email Seeded User

If you ran the seed script:
```bash
npm run seed:admin
```

Use these credentials to test:
- Email: `admin@edwom.com`
- Password: `Admin@123456`

Try resetting this user's password using the forgot password flow.

---

## 10. Common Issues & Fixes

### Issue: "dbConnect is not a function"
**Fix:** Check import - should be:
```typescript
import dbConnect from '@/lib/mongodb';
// NOT
import { dbConnect } from '@/lib/mongodb';
```

### Issue: "useSearchParams not wrapped in Suspense"
**Fix:** The reset-password page is already fixed with Suspense boundary. If you modify it, remember:
```typescript
import { Suspense } from 'react';

// Wrap component using useSearchParams in Suspense
<Suspense fallback={<Loading />}>
  <ComponentWithSearchParams />
</Suspense>
```

### Issue: Token not persisting
**Fix:** Restart MongoDB and dev server:
```bash
# Stop dev server (Ctrl+C)
npm run dev
```

### Issue: Always getting rate limit error
**Fix:** The in-memory rate limiter clears old records after 30 minutes. Wait or:
- Restart dev server (clears memory)
- Use different email addresses

---

## Useful Browser Console Commands

In DevTools console (F12) while on password reset pages:

```javascript
// Check React Query state
window.__REACT_QUERY_DEVTOOLS__

// View useSearchParams (on reset-password page)
new URLSearchParams(window.location.search).get('token')
```

---

## Next Steps After Testing

1. ✅ **Verify password reset flow works end-to-end**
2. ⏳ **Set up email sending** (SendGrid or Nodemailer)
3. ⏳ **Add CAPTCHA to prevent abuse**
4. ⏳ **Set up Redis for rate limiting** (production)
5. ⏳ **Add security logging**
6. ⏳ **Deploy to Vercel**

---

## Success Checklist

- ✅ Forgot password page loads
- ✅ Email validation works
- ✅ Rate limiting prevents spam
- ✅ Reset link generated in console
- ✅ Reset password page validates token
- ✅ Token expires after 15 minutes
- ✅ Password reset updates in MongoDB
- ✅ New password works for login
- ✅ Old password no longer works
- ✅ All API endpoints respond correctly

---

**You're ready to test!** Run `npm run dev` and visit http://localhost:3000/auth/forgot-password
