# EdwomOnline Authentication System - Fixes & Best Practices

## Overview
This document summarizes the authentication fixes applied to EdwomOnline to ensure proper user sign-up, sign-in, Google OAuth integration, and role-based access control for admin features.

---

## Issues Fixed

### 1. **NextAuth Configuration Consolidation**
**Problem:** The NextAuth configuration was split/duplicated across files, causing confusion about which file was authoritative.

**Solution:** 
- Consolidated all NextAuth configuration in `src/app/pages/api/auth/[...nextauth].ts`
- Exported `authOptions` for reuse in other endpoints
- Removed duplicate configuration from `src/app/pages/api/admin/users.ts`

**File:** `src/app/pages/api/auth/[...nextauth].ts`

### 2. **Google OAuth Auto-User Creation**
**Problem:** Google OAuth users weren't being created in the database; they could sign in but had no stored profile.

**Solution:**
- Enhanced JWT callback to detect Google OAuth sign-ins via `account?.provider === 'google'`
- Automatically creates user in MongoDB if they don't exist
- Sets `isEmailVerified: true` for OAuth users (trusted by Google)
- Assigns default `role: 'user'` to new OAuth users

**File:** `src/app/pages/api/auth/[...nextauth].ts` - JWT callback

### 3. **Session Token Enrichment**
**Problem:** User ID and role weren't being properly attached to session tokens.

**Solution:**
- JWT callback now properly attaches `token.id`, `token.email`, and `token.role`
- Session callback adds these fields to `session.user`
- Extended type definitions in `src/app/types/next-auth.d.ts` to include all fields

**Files:** 
- `src/app/pages/api/auth/[...nextauth].ts`
- `src/app/types/next-auth.d.ts`

### 4. **Sign-Up Endpoint Improvements**
**Problem:** Signup endpoint lacked proper error handling, didn't return user ID, and had mixed password hashing approaches.

**Solution:**
- Centralized password hashing via `hashPassword()` utility (uses bcrypt salt factor 10)
- Returns user object with ID on success (200 created)
- Proper error handling with try-catch
- Consistent validation messages

**File:** `src/app/pages/api/signup.ts`

### 5. **Sign-In Endpoint Clarification**
**Problem:** Signin endpoint was ambiguous—it didn't actually perform sign-in, but the code made it seem like it should.

**Solution:**
- Clarified that `/api/signin` is a **session check endpoint only**
- Actual authentication happens at `/api/auth/callback/credentials` (NextAuth)
- Endpoint now uses `getServerSession()` to check existing sessions
- Returns `{ authenticated: true/false, user }` for clarity

**File:** `src/app/pages/api/signin.ts`

### 6. **Admin Users Management API**
**Problem:** Admin user management API didn't exist as a separate endpoint.

**Solution:**
- Created `/api/admin/users.ts` with full role-based access control
- **GET:** List all users (with optional filters by role/email)
- **PATCH:** Update user status and role
- Validates admin role before allowing operations
- Returns user list without password hashes (security)

**File:** `src/app/pages/api/admin/users.ts`

### 7. **TypeScript Type Issues**
**Problem:** NextAuth type extensions were incomplete; TypeScript complained about accessing user properties.

**Solution:**
- Extended `Session`, `User`, and `JWT` interfaces in `src/app/types/next-auth.d.ts`
- Added `id` and `role` to all three interfaces
- Used type assertions `(value as any)` where necessary for Mongoose document access

**File:** `src/app/types/next-auth.d.ts`

### 8. **Import Path Standardization**
**Problem:** Mix of relative imports (`../../../../lib/mongodb`) made code fragile and hard to refactor.

**Solution:**
- Standardized all imports to use `@/` path alias (configured in `tsconfig.json`)
- New pattern: `@/lib/mongodb`, `@/models/User`, `@/app/utils/hash`
- Cleaner, more maintainable code

**Files:**
- `src/app/pages/api/signup.ts`
- `src/app/pages/api/auth/[...nextauth].ts`
- `src/app/pages/api/admin/users.ts`

---

## Authentication Flow (Updated)

### Credentials Sign-Up
```
1. User POSTs to /api/signup with { email, password, name }
2. Endpoint validates email format & password length (≥6 chars)
3. Checks for duplicate email
4. Hashes password with bcrypt (salt factor 10)
5. Creates user with role='user', isEmailVerified=false
6. Returns 201 with user object (excluding passwordHash)
```

### Credentials Sign-In
```
1. User POSTs credentials to NextAuth
2. NextAuth calls Credentials provider authorize()
3. Provider queries DB, verifies password hash
4. Returns user { id, email, name, role }
5. JWT callback enriches token with role and id
6. Session callback adds role to session.user
7. User now authenticated for 30 days (token maxAge)
```

### Google OAuth Sign-In
```
1. User initiates Google OAuth flow
2. Google redirects to NextAuth callback
3. JWT callback detects account.provider === 'google'
4. Queries DB for existing user by email
5. If not found, creates new user with role='user', isEmailVerified=true
6. Returns enriched JWT token with role and id
7. User authenticated; no password set for OAuth account
```

### Session Verification
```
GET/POST /api/signin:
- Calls getServerSession() to check existing JWT
- Returns { authenticated: true, user } or { authenticated: false }
- No credentials needed; relies on cookie-stored JWT
```

---

## Environment Variables (Vercel Deployment)

Add these to your Vercel project settings (Settings > Environment Variables):

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# NextAuth
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-domain.com

# Google OAuth
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>

# Legacy (optional, fallback)
MongoURL=mongodb+srv://...
```

**⚠️ CRITICAL for Vercel:**
- `NEXTAUTH_URL` must match your production domain exactly (e.g., `https://edwom-online.vercel.app`)
- Without this, NextAuth sessions won't work on production
- Generate a new `NEXTAUTH_SECRET` for production (don't reuse dev secret)

---

## Testing Checklist

### Local Development
- [ ] Start server: `npm run dev`
- [ ] Test signup at `/api/auth/signin` UI
- [ ] Test email/password registration
- [ ] Test Google OAuth sign-in
- [ ] Verify session persists on page reload
- [ ] Check user role in browser console: `useSession()` hook

### Before Vercel Deployment
- [ ] All environment variables added to Vercel project
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] Test signup/signin locally after deployment
- [ ] Verify OAuth redirect URIs in Google Console match Vercel domain
- [ ] Check MongoDB connection from Vercel logs
- [ ] Test admin endpoints with admin user account

---

## File Reference

| File | Purpose |
|------|---------|
| `src/app/pages/api/auth/[...nextauth].ts` | **Auth config hub** - NextAuth providers, callbacks, JWT enrichment |
| `src/app/pages/api/signup.ts` | User registration endpoint |
| `src/app/pages/api/signin.ts` | Session check endpoint |
| `src/app/pages/api/admin/users.ts` | Admin user management (list, update roles) |
| `src/app/types/next-auth.d.ts` | TypeScript type extensions for Session/User/JWT |
| `src/app/pages/_app.tsx` | SessionProvider wrapper for all pages |
| `src/app/utils/hash.ts` | Password hashing utilities (bcrypt) |
| `src/lib/mongodb.ts` | Mongoose connection with serverless caching |
| `src/models/User.ts` | User schema with role validation |

---

## Key Patterns Used

### 1. JWT-Based Sessions (Not Database)
- Sessions stored in signed JWT tokens, not database
- Stateless authentication; scales well on serverless
- 30-day max age; token refresh on each request

### 2. Role-Based Access Control (RBAC)
- Roles: `'user'` (default) or `'admin'`
- Attached to JWT token, accessible in all requests
- Admin endpoints check role before returning data

### 3. Mongoose Connection Caching
- Uses global `__mongoose_cache` to avoid connection leaks on serverless
- Single connection reused across function invocations
- See `src/lib/mongodb.ts` for pattern

### 4. OAuth Auto-Account Creation
- First-time Google OAuth users automatically created in DB
- Email verified by default (trusted by Google)
- No password set for OAuth accounts (stored as empty string)

---

## Troubleshooting

### "No user found with the email" error
- Verify email exists in MongoDB
- Check MongoDB connection string in `.env.local`
- Ensure `MONGODB_URI` takes precedence over `MongoURL`

### "Account uses OAuth. Please sign in with OAuth provider."
- User registered via Google, not email/password
- Direct them to Google OAuth sign-in button
- Cannot use password-based login for OAuth accounts

### Session not persisting after sign-in
- Check `NEXTAUTH_SECRET` is set and consistent
- Verify `NEXTAUTH_URL` matches your domain
- Clear browser cookies and retry
- On Vercel, wait ~1 min for environment variables to propagate

### Google OAuth redirect error
- Verify authorized redirect URI in Google Cloud Console includes your domain
- Example: `https://your-domain.com/api/auth/callback/google`
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel env vars

### Mongoose "Multiple connections" warning
- Normal on development with hot-reload
- Connection caching in `mongodb.ts` prevents leaks
- Warning disappears once hot-reload stabilizes

---

## Next Steps for EdwomOnline

### Phase 1: User Features (MVP)
- [ ] Create login/signup UI pages
- [ ] Implement cart with persistent state
- [ ] Build product browsing pages
- [ ] Add product search and filters

### Phase 2: User Features (Post-MVP)
- [ ] Implement checkout flow
- [ ] Add order history
- [ ] Create user profile pages
- [ ] Add email notifications

### Phase 3: Admin Features
- [ ] Build admin dashboard
- [ ] Implement product/category management
- [ ] Create order management interface
- [ ] Add analytics dashboard

### Phase 4: Advanced Features
- [ ] Inventory management
- [ ] Promotions and discounts
- [ ] Package/meal creation
- [ ] Referral program

---

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Vercel Deployment Guide](https://vercel.com/docs/concepts/deployments/overview)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Mongoose Documentation](https://mongoosejs.com/)

