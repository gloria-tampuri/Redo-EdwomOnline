# Password Reset Implementation with React Query

## Overview

✅ **Complete implementation of password reset functionality** with React Query for advanced state management. The system provides a secure, user-friendly password recovery flow.

---

## What Was Implemented

### 1. **React Query Setup** ✅
- Installed `@tanstack/react-query` for async state management
- Created `src/app/QueryProvider.tsx` with:
  - Global QueryClient configuration
  - 5-minute stale time, 10-minute cache time
  - Automatic retry on failed mutations
  - Disabled refetch on window focus (prevents unnecessary requests)
- Integrated QueryProvider into `src/app/RootLayoutClient.tsx`
  - Wraps SessionProvider for proper context nesting

### 2. **Database Schema Updates** ✅
Updated `src/models/User.ts` with three new optional fields:
```typescript
resetPasswordToken?: string;      // Stores JWT reset token
resetPasswordExpires?: Date;       // Token expiration timestamp
resetPasswordAttempts?: number;    // Track failed attempts (future feature)
```

### 3. **API Endpoints** ✅

#### **POST /api/auth/forgot-password**
- Accepts email address
- Validates email format
- Rate limiting: Max 3 requests per email per 15 minutes
- Generates JWT token with 15-minute expiration
- Stores token in MongoDB
- **Security:** Returns success message regardless of email existence (prevents email enumeration)
- **Development:** Logs reset link to console for testing

Example request:
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

#### **GET /api/auth/verify-reset-token?token=xxx**
- Validates JWT signature and expiration
- Verifies token exists in database and matches user
- Returns user email if valid
- Returns 410 (Gone) for expired tokens
- Returns 401 for invalid/tampered tokens

#### **POST /api/auth/reset-password**
- Accepts token and new password
- Validates token expiration
- Hashes new password with bcrypt (salt factor 10)
- Updates user passwordHash
- Clears reset token fields
- Resets password attempt counter

Example request:
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"jwt_token_here","newPassword":"NewP@ss123"}'
```

### 4. **React Query Custom Hooks** ✅
Created `src/hooks/usePasswordReset.ts`:

```typescript
// Mutation: Request password reset email
useForgotPassword()
  → mutate({ email: string })
  → isLoading, error, data, isSuccess

// Query: Validate reset token
useVerifyResetToken(token: string | null)
  → enabled when token exists
  → data.email on success
  → error if expired/invalid

// Mutation: Reset password with new password
useResetPassword()
  → mutate({ token: string, newPassword: string })
  → isLoading, error, data, isSuccess
```

### 5. **Frontend Components** ✅

#### **ForgotPasswordForm Component**
- Email input with Zod validation
- Submits via React Query mutation
- Shows "Success" message after submission
- Success message auto-dismisses after 5 seconds
- Displays backend error messages
- Links back to login page
- Loading states on submit button

#### **ResetPasswordForm Component**
- Two password fields: "New Password" and "Confirm Password"
- Password visibility toggles (👁️ / 🙈 icons)
- Zod validation with password confirmation matching
- Minimum 6 character requirement
- Success state with redirect after 2 seconds
- Error display with detailed messages
- Uses React Query useResetPassword mutation

### 6. **Pages** ✅

#### **/auth/forgot-password** 
- Client-side page redirects authenticated users home
- Uses AuthLayout for consistent branding
- Renders ForgotPasswordForm
- Accessible from login page "Forgot password?" link

#### **/auth/reset-password?token=xxxxx**
- Wrapped in Suspense boundary for useSearchParams
- Validates token via useVerifyResetToken query
- Shows loading spinner while validating
- Shows error if token invalid/expired with retry link
- Renders ResetPasswordForm if token valid
- Auto-redirects to login after successful reset

---

## Security Features

✅ **JWT Token Generation**
- Uses `jsonwebtoken` library
- 15-minute expiration window
- Signed with NEXTAUTH_SECRET
- Stored in MongoDB for validation

✅ **Password Security**
- New passwords hashed with bcrypt (salt factor 10)
- Passwords never sent in plain text via API
- HTTPS recommended in production

✅ **Rate Limiting**
- In-memory limiter prevents brute force
- Max 3 requests per email per 15-minute window
- Returns 429 (Too Many Requests) when exceeded
- **Note:** Use Redis in production for distributed deployments

✅ **Email Enumeration Prevention**
- forgot-password endpoint returns success for non-existent emails
- Prevents attackers from discovering registered emails

---

## File Structure

```
src/
├── app/
│   ├── QueryProvider.tsx                    # React Query setup
│   ├── auth/
│   │   ├── forgot-password/
│   │   │   └── page.tsx                    # Forgot password page
│   │   └── reset-password/
│   │       └── page.tsx                    # Reset password page
│   ├── api/auth/
│   │   ├── forgot-password/
│   │   │   └── route.ts                    # POST endpoint
│   │   ├── verify-reset-token/
│   │   │   └── route.ts                    # GET endpoint
│   │   └── reset-password/
│   │       └── route.ts                    # POST endpoint
│   └── RootLayoutClient.tsx                # Updated with QueryProvider
├── components/auth/
│   ├── ForgotPasswordForm.tsx              # Email form
│   └── ResetPasswordForm.tsx               # Password reset form
├── hooks/
│   └── usePasswordReset.ts                 # React Query hooks
└── models/
    └── User.ts                             # Updated schema
```

---

## Testing the Password Reset Flow

### Manual Testing Steps

1. **Start Dev Server**
   ```bash
   npm run dev
   ```

2. **Access Forgot Password**
   - Navigate to http://localhost:3000/auth/login
   - Click "Forgot password?" link

3. **Request Reset**
   - Enter email: `admin@edwom.com` (or any registered email)
   - Click "Send Reset Link"
   - Watch console for reset link (copy the URL)
   - Example output:
     ```
     📧 Password Reset Link (copy to browser):
     http://localhost:3000/auth/reset-password?token=eyJhbGciOiJIUzI1NiIs...
     ```

4. **Verify Token**
   - Paste reset link into browser
   - Should show ResetPasswordForm if token valid
   - Should show error if token expired (after 15 minutes)

5. **Reset Password**
   - Enter new password (min 6 characters)
   - Confirm password (must match)
   - Click "Reset Password"
   - Should redirect to login with success message

6. **Verify Login Works**
   - Sign in with email and NEW password
   - Should succeed and redirect to home

---

## Environment Variables

No new environment variables needed. Uses existing:
- `NEXTAUTH_SECRET` - For JWT signing
- `MONGODB_URI` - For storing reset tokens

---

## Next Steps: Email Sending

⏳ **TODO:** To make this production-ready, implement email notifications:

### Option 1: SendGrid (Recommended)
```bash
npm install @sendgrid/mail
```

Add to `.env.local`:
```bash
SENDGRID_API_KEY=your_api_key_here
```

### Option 2: Nodemailer
```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

Add to `.env.local`:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

Then implement email utility in `src/utils/email.ts` and call it from forgot-password endpoint.

---

## Build Output

✅ **Build Successful**
```
✓ Compiled successfully in 5.2s
✓ Finished TypeScript in 9.4s
✓ Collecting page data in 3.1s
✓ Generating static pages in 1961.1ms

Routes:
├ ƒ /api/auth/forgot-password
├ ƒ /api/auth/reset-password
├ ƒ /api/auth/verify-reset-token
├ ○ /auth/forgot-password
└ ○ /auth/reset-password
```

---

## React Query Benefits

✅ **Automatic Caching**
- Mutations automatically invalidate relevant data
- Prevents duplicate API calls

✅ **Loading States**
- isPending while request in flight
- Show spinners, disable buttons automatically

✅ **Error Handling**
- Errors properly typed and displayed
- Retry logic built-in

✅ **DevTools Integration** (Optional)
- Install @tanstack/react-query-devtools for debugging
- Inspect queries, mutations, cache state

---

## Troubleshooting

### Reset Token Not Found
**Problem:** Token parameter missing or malformed
**Solution:** Copy full URL from console including `?token=...`

### Token Expired Error
**Problem:** More than 15 minutes passed since requesting reset
**Solution:** Request a new reset link (start over at forgot-password)

### Password Mismatch
**Problem:** Confirmation password doesn't match
**Solution:** Ensure both passwords are identical; note password is case-sensitive

### Rate Limit Hit
**Problem:** "Too many reset requests" error
**Solution:** Wait 15 minutes before requesting another reset

---

## Security Considerations

⚠️ **BEFORE PRODUCTION:**
1. Replace in-memory rate limiter with Redis
2. Implement actual email sending (SendGrid/Nodemailer)
3. Add IP rate limiting on API endpoints
4. Enable HTTPS only (set secure cookies)
5. Consider adding CAPTCHA to prevent abuse
6. Monitor failed reset attempts for security
7. Add logging for security audit trail
8. Consider adding email verification before allowing reset

---

## Code Examples

### Using the Forgot Password Hook
```typescript
'use client';
import { useForgotPassword } from '@/hooks/usePasswordReset';

export function MyComponent() {
  const { mutate, isPending, error } = useForgotPassword();

  const handleSubmit = (email: string) => {
    mutate({ email }, {
      onSuccess: (data) => {
        console.log('Reset link sent:', data.message);
      },
      onError: (err) => {
        console.error('Error:', err.message);
      }
    });
  };

  return (
    <button onClick={() => handleSubmit('user@example.com')} disabled={isPending}>
      {isPending ? 'Sending...' : 'Send Reset Link'}
    </button>
  );
}
```

### Using the Reset Password Hook
```typescript
'use client';
import { useResetPassword } from '@/hooks/usePasswordReset';

export function MyResetForm({ token }: { token: string }) {
  const { mutate, isPending } = useResetPassword();

  const handleReset = (newPassword: string) => {
    mutate({ token, newPassword }, {
      onSuccess: () => {
        // Redirect to login
        window.location.href = '/auth/login';
      }
    });
  };

  return (
    <button onClick={() => handleReset('NewPass123')} disabled={isPending}>
      Reset Password
    </button>
  );
}
```

---

## Changelog

### Version 1.0.0 - Password Reset with React Query
- ✅ React Query integration
- ✅ Three API endpoints (forgot-password, verify-token, reset-password)
- ✅ Custom hooks for password reset
- ✅ Frontend pages and forms
- ✅ JWT token generation and validation
- ✅ Rate limiting
- ✅ Zod validation
- ✅ TypeScript support
- ✅ Suspense boundary for useSearchParams
- ⏳ Email sending (TODO)
- ⏳ CAPTCHA protection (TODO)
- ⏳ Email verification (TODO)

---

## Questions?

Refer to:
- `.github/copilot-instructions.md` - Project guidelines
- `AUTHENTICATION_FIXES.md` - Auth system details
- React Query Docs: https://tanstack.com/query/latest
