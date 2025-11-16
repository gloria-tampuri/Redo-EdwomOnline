# Copilot Instructions for EdwomOnline

## Project Overview

**EdwomOnline** is a Next.js 15 full-stack web application with user authentication, role-based access control (user/admin roles), and a Radix UI-based component library. The project uses TypeScript, MongoDB/Mongoose, bcrypt for password hashing, and NextAuth for session management.

**Stack:**
- Framework: Next.js 15.5.4 with Turbopack (dev/build)
- Auth: NextAuth 4.24.13 (JWT strategy + Credentials + Google OAuth)
- Database: MongoDB with Mongoose 8.19.4
- UI: React 19 + Radix UI + Tailwind CSS 4 + shadcn/ui pattern
- Forms: React Hook Form + Zod validation
- Styling: Tailwind CSS 4 with custom theme variables

---

## Critical Architecture Patterns

### 1. **Authentication Flow**
- **Location:** `src/app/pages/api/auth/[...nextauth].ts`
- **Providers:** Credentials (email/password) + Google OAuth
- **Session Strategy:** JWT-based (not database sessions)
- **Key Pattern:** NextAuth callbacks enrich the token with user `role` and pass it to session
- **Role Integration:** User roles (`user` | `admin`) defined in MongoDB schema and extended via `src/app/types/next-auth.d.ts`
- **Password Handling:** Uses bcrypt with salt factor 10 (`src/app/utils/hash.ts`)
  - `hashPassword()` - Hash on signup
  - `comparePasswords()` - Verify on login (aliased as `verifyPassword`)
- **OAuth Note:** Google Provider required—users with OAuth accounts cannot use password-based login

### 2. **Database Architecture**
- **Connection:** Mongoose with connection caching for serverless/hot-reload (`src/lib/mongodb.ts`)
- **Cache Pattern:** Global `__mongoose_cache` object prevents connection leaks
- **Environment:** Expects `MONGODB_URI` or `MongoURL` in `.env.local`
- **Schema:** User model (`src/models/User.ts`) with:
  - Unique email constraint
  - Auto `updatedAt` timestamp via pre-save hook
  - Enum role validation (must be `'user'` or `'admin'`)
- **Fallback DB:** Legacy `src/lib/db.ts` uses raw MongoDB client (superseded by Mongoose approach)

### 3. **User Service Layer**
- **Location:** `src/app/services/userService.ts`
- **Exports:**
  - `createUser(email, password, name)` - Hashes password, defaults role to `'user'`
  - `findUserByEmail(email)` - Query for existing user
  - `verifyEmail(userId)` - Mark email as verified
- **Separation:** Service layer abstracts hashing/DB from API routes

### 4. **API Route Structure**
- **Signup:** `src/app/pages/api/signup.ts`
  - Validates email format, password length ≥6 chars
  - Checks duplicate emails before insertion
  - Returns 409 if user exists, 201 on success
- **Signin:** `src/app/pages/api/signin.ts`
  - Checks existing NextAuth session
  - Credentials validation delegated to NextAuth provider (not this endpoint)
- **Admin API:** `src/app/pages/api/admin/users.ts` - Exists but not shown; likely role-protected

---

## Dependency Integration Points

### Environment Variables Required
```bash
# Database
MONGODB_URI          # Mongoose connection (primary, takes precedence)
MongoURL             # Fallback for legacy db.ts

# NextAuth (Session & Auth)
NEXTAUTH_SECRET      # JWT signing key (generate with `openssl rand -base64 32`)
NEXTAUTH_URL         # Application URL (local: http://localhost:3000, production: https://yourdomain.com)

# OAuth (Google)
GOOGLE_CLIENT_ID     # From Google Cloud Console
GOOGLE_CLIENT_SECRET # From Google Cloud Console
```

### Vercel Deployment Setup
- **Environment Variables:** Add all above to Vercel project settings (Settings > Environment Variables)
- **NEXTAUTH_URL:** Must match your production domain (e.g., `https://edwom-online.vercel.app`)
- **Build:** Runs `next build --turbopack`; no custom build steps needed
- **Database Connection:** Ensure MongoDB connection string works from Vercel's environment
- **Serverless Functions:** Each API route becomes a serverless function; connections are cached via `__mongoose_cache`
- **Edge Functions:** Not currently used; standard Node.js serverless

### Module Paths (TypeScript)
- Configured in `tsconfig.json`: `@/*` → `src/*`
- Use `@/models/User`, `@/lib/mongodb` in imports (though not yet consistently applied)

### UI Component Library
- **Pattern:** Radix UI primitives wrapped in Tailwind-styled components
- **Location:** `src/components/ui/` (button, form, input, select, dropdown-menu, dialog, etc.)
- **Form Integration:** React Hook Form + Zod for validation + custom Form component

### Styling
- **Tailwind 4** with custom theme in `src/app/globals.css`
- **Variable-driven:** Colors (background, foreground, primary, etc.) and radius tokens
- **Dark Mode:** Supported via `@custom-variant dark`
- **Animation:** `tw-animate-css` package integrated

---

## Project-Specific Conventions

### 1. **File Organization**
- API routes use Next.js Pages Router convention (`src/app/pages/api/`)
- Business logic abstracted to `services/` (e.g., `userService.ts`)
- Models in `models/` (Mongoose schemas only)
- Database utilities in `lib/`
- Utilities in `utils/` (hash, formatting, etc.)

### 2. **Error Handling**
- NextAuth: Credentials provider throws `Error` with message (shown in UI)
- API routes: Use HTTP status codes (400, 405, 409, 201)
- No global error boundary documented—recommend adding one

### 3. **Validation Patterns**
- **Zod schemas** available (dependency included) but not yet implemented in signup/signin
- **Current approach:** Manual regex + length checks in API routes
- **Recommendation for AI:** Use Zod schema definitions in `src/types/schemas/` when adding new validation

### 4. **TypeScript Practices**
- Strict mode enabled
- NextAuth type extensions via module augmentation (`next-auth.d.ts`)
- Use `as any` sparingly (seen in NextAuth callbacks—can be improved with proper typing)

---

## Authentication Workflow (EdwomOnline)

### Sign-Up Flow
1. User POST to `/api/signup` with `{ email, password, name }`
2. Endpoint validates email format, password length ≥6 chars
3. Checks for duplicate email; returns 409 if exists
4. Hashes password with bcrypt (salt factor 10), creates user with role='user'
5. Returns 201 with user details (excluding passwordHash)

### Sign-In Flow
1. **Credentials Provider:** User submits email/password to NextAuth
2. NextAuth calls Credentials provider `authorize()` callback
3. Fetches user from DB, verifies password hash
4. Returns minimal user object `{ id, email, name, role }`
5. JWT callback enriches token with user role and id
6. Session callback adds role to session.user

### Google OAuth Flow
1. User clicks "Sign in with Google"
2. Google OAuth callback is handled by NextAuth
3. **Auto-user-creation:** If user doesn't exist in DB, `jwt` callback creates them
4. User marked as `isEmailVerified: true` (from Google)
5. New users default to role='user'

### Session & Token
- **Strategy:** JWT (not database sessions)
- **Max Age:** 30 days (token and session)
- **Token Fields:** id, email, name, role
- **Session Fields:** user { id, email, name, role, image? }

### Key Files
- Auth config: `src/app/pages/api/auth/[...nextauth].ts` - Providers, callbacks, JWT enrichment
- Sign-up: `src/app/pages/api/signup.ts` - User registration validation
- Sign-in check: `src/app/pages/api/signin.ts` - Session status endpoint
- Admin API: `src/app/pages/api/admin/users.ts` - Admin-only user management
- Type extensions: `src/app/types/next-auth.d.ts` - Session/JWT/User interfaces

---

## Build & Development Workflows

### Development
```bash
npm run dev
# Starts Next.js dev server with Turbopack on port 3000
# Auto-reload on file changes
```

### Production Build
```bash
npm run build
# Compiles with Turbopack, optimizes for deployment
npm run start
# Runs production server
```

### Vercel Deployment
1. **Connect repo:** Link GitHub repo to Vercel
2. **Environment variables:** Add all vars from `.env.local` in Vercel Settings > Environment Variables
   - `MONGODB_URI` - MongoDB connection (Atlas recommended)
   - `NEXTAUTH_SECRET` - Generate: `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Set to your production domain (e.g., `https://edwom-online.vercel.app`)
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
3. **Deploy:** Push to main/master branch; Vercel auto-builds with `next build --turbopack`
4. **Serverless:** Each API route becomes a serverless function; Mongoose connections cached via `__mongoose_cache`
5. **Testing:** Visit `/api/auth/signin` to test NextAuth configuration

### Key Dev Considerations
- **Turbopack:** Used in both dev and build; faster than webpack
- **Hot Reload:** Works for server and client code
- **Database:** Must be running; connection errors will appear in dev server logs
- **NextAuth:** Debug via `next-auth` URL (`/api/auth/signin`, `/api/auth/callback/google`)
- **MongoDB:** Connection pooling handled by Mongoose caching—do not reconnect on every request

---

## Cross-Component Communication

### Session Access
- **Client-side:** `useSession()` from `next-auth/react`
- **Server-side (API routes):** `getSession({ req })` from `next-auth/react`
- **Type:** Extended with `role` field (admin/user)

### Role-Based Access
- Roles stored in JWT token, accessible in session
- Recommendation: Create a middleware/hook (`withAuth`, `withAdminAuth`) for route protection
- Currently no documented route guards—implement in `/api/admin/*` routes

---

## When Adding New Features

1. **New API Endpoint:**
   - Follow `src/app/pages/api/*.ts` pattern (NextApiRequest/Response)
   - Add validation before DB operations
   - Use `dbConnect()` before querying MongoDB

2. **New UI Components:**
   - Build on `src/components/ui/` Radix UI wrappers
   - Use Tailwind classes; reference theme variables in `globals.css`
   - Export from component file; import in pages

3. **Authentication Changes:**
   - Update `[...nextauth].ts` providers/callbacks
   - Extend `next-auth.d.ts` if session shape changes
   - Test with `npm run dev` and visit `/api/auth/signin`

4. **Database Schema Changes:**
   - Modify `src/models/User.ts` (or new model files)
   - Add pre-save hooks if needed (like `updatedAt`)
   - No migrations tool configured—manual handling required

---

## Known Gaps & Recommendations

- **Route Protection:** No middleware guards for admin endpoints—add soon
- **Error Boundaries:** No React error boundary—add to `layout.tsx`
- **Validation:** Mix of manual checks and Zod; consolidate to Zod schemas
- **Logging:** Consider structured logging (winston/pino) for production
- **Testing:** No test framework visible; recommend Jest + MSW for e2e auth testing

