# EdwomOnline Quick Dev Guide

## Getting Started

### 1. Local Development Setup
```bash
# Install dependencies
npm install

# Create .env.local with:
MONGODB_URI=mongodb+srv://YOUR_MONGO_CONNECTION_STRING
NEXTAUTH_SECRET=your-secret-key (generate: openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Start dev server
npm run dev
# Opens http://localhost:3000
```

### 2. Test Authentication
- **Sign-up:** POST to `/api/signup` with `{ email, password, name }`
- **Credentials Sign-in:** Visit `/api/auth/signin` for NextAuth UI
- **Check Session:** GET `/api/signin` to verify active session
- **Google OAuth:** Sign-in button redirects to Google, auto-creates user

---

## Common Authentication Tasks

### Protect an API Route
```typescript
// src/app/pages/api/protected.ts
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // User is authenticated
  const userRole = (session.user as any).role;
  res.json({ message: 'Success', role: userRole });
}
```

### Check Session in React Component
```typescript
// Client-side component
import { useSession } from 'next-auth/react';

export function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'unauthenticated') return <p>Sign in first</p>;
  
  return <p>Welcome {session?.user?.name} ({session?.user?.role})</p>;
}
```

### Protect Route (Admin Only)
```typescript
// src/app/pages/api/admin/protected.ts
const session = await getServerSession(req, res, authOptions);

if (!session || (session.user as any).role !== 'admin') {
  return res.status(403).json({ message: 'Forbidden' });
}

// Admin endpoint logic
```

---

## Deployment Checklist

### Before Pushing to Vercel
- [ ] All auth endpoints tested locally
- [ ] No hardcoded secrets in code
- [ ] `.env.local` is in `.gitignore`
- [ ] OAuth redirect URIs updated in Google Console

### Add to Vercel Environment Variables
```
MONGODB_URI=<production_mongodb_connection>
NEXTAUTH_SECRET=<NEW_SECRET_key>
NEXTAUTH_URL=https://your-domain.com
GOOGLE_CLIENT_ID=<your_client_id>
GOOGLE_CLIENT_SECRET=<your_client_secret>
```

### After Deployment
- [ ] Test signup/signin on production domain
- [ ] Verify Google OAuth works
- [ ] Check MongoDB connections in logs
- [ ] Test admin endpoints with admin account

---

## API Endpoint Reference

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/signup` | POST | Register new user | No |
| `/api/signin` | GET/POST | Check session status | No |
| `/api/auth/signin` | GET | NextAuth sign-in UI | No |
| `/api/auth/callback/credentials` | POST | Credentials auth (internal) | No |
| `/api/auth/callback/google` | POST | Google OAuth callback (internal) | No |
| `/api/auth/session` | GET | Get current session | No |
| `/api/auth/signout` | POST | Sign out (clear JWT) | Yes |
| `/api/admin/users` | GET | List all users | Yes (admin) |
| `/api/admin/users` | PATCH | Update user | Yes (admin) |

---

## File Structure for Authentication

```
src/
├── app/
│   ├── pages/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth].ts          ← Auth config hub
│   │   │   ├── signup.ts                      ← Registration
│   │   │   ├── signin.ts                      ← Session check
│   │   │   └── admin/users.ts                 ← Admin management
│   │   └── _app.tsx                           ← SessionProvider wrapper
│   ├── types/
│   │   └── next-auth.d.ts                     ← Type extensions
│   └── utils/
│       └── hash.ts                            ← Password utilities
├── lib/
│   └── mongodb.ts                             ← DB connection
└── models/
    └── User.ts                                ← Mongoose schema
```

---

## Debugging Tips

### Enable NextAuth Debug Mode
```typescript
// In src/app/pages/api/auth/[...nextauth].ts
export const authOptions = {
  // ... config
  debug: process.env.NODE_ENV === 'development', // Enable in dev
};
```

### Check Database Queries
```bash
# In MongoDB Atlas, check:
1. Database > Collections > users
2. Verify user records exist
3. Check email/passwordHash fields
```

### Inspect JWT Token
```typescript
// In any NextAuth callback
console.log('Token:', token);
console.log('User:', user);
console.log('Session:', session);
```

### View NextAuth Logs
- Dev server console output
- Check browser Network tab for `/api/auth/*` requests
- Look for error messages in request responses

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Email and password required" | Missing fields in signup | Check request body includes all fields |
| "User already exists" | Email already registered | Use different email or password reset |
| "Invalid password" | Wrong password | Verify password is correct |
| "Account uses OAuth" | User signed up with Google | Use Google OAuth to sign in |
| "NEXTAUTH_URL not set" | Missing environment variable | Add to `.env.local` or Vercel env vars |
| "Cannot find module '@/lib/mongodb'" | Path alias not working | Check `tsconfig.json` has `@/*` mapped |

---

## Security Best Practices

✅ **DO:**
- Hash passwords with bcrypt (salt factor ≥10)
- Use HTTPS in production
- Rotate `NEXTAUTH_SECRET` regularly
- Store sensitive env vars in Vercel, never in code
- Validate input on both client AND server
- Check user role before returning sensitive data

❌ **DON'T:**
- Send passwords in plaintext over HTTP
- Expose `NEXTAUTH_SECRET` in client code
- Trust client-side role checks alone
- Store plaintext passwords in database
- Reuse secrets between dev/prod
- Log passwords or tokens to console

---

## Next: Building User Features

See `AUTHENTICATION_FIXES.md` for detailed auth implementation.

Ready to build:
1. Landing page with sign-up/login UI
2. Product catalog pages
3. Shopping cart functionality
4. Checkout flow
5. Admin dashboard

Questions? Check the `.github/copilot-instructions.md` for architecture details.
