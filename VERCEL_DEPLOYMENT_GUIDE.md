# Vercel Deployment Guide for EdwomOnline

## Pre-Deployment Checklist

### 1. Local Testing (Complete)
- [x] Authentication system fixed and tested locally
- [x] All imports use `@/` path alias
- [x] TypeScript compilation passes
- [x] Database connection works

### 2. Code Repository
- [ ] Push all changes to GitHub master/main branch
- [ ] `.env.local` is in `.gitignore` (NEVER commit secrets)
- [ ] No console.logs with sensitive data
- [ ] All branches merged into production branch

### 3. Prepare Credentials

Before deploying, gather these credentials:

#### MongoDB Atlas
```
1. Go to https://account.mongodb.com/account/login
2. Create/select your cluster
3. Click "Connect" → "Drivers"
4. Select "Node.js" version 4.x
5. Copy connection string: mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
6. Replace <password> with your database password
```

#### Google OAuth
```
1. Go to Google Cloud Console: https://console.cloud.google.com
2. Create project or select existing
3. Enable "Google+ API"
4. Go to Credentials → Create OAuth 2.0 Client IDs
5. Application type: "Web application"
6. Authorized JavaScript origins: https://your-domain.com
7. Authorized redirect URIs:
   - https://your-domain.com/api/auth/callback/google
8. Copy Client ID and Client Secret
```

#### NextAuth Secret
```bash
# Generate random string for NEXTAUTH_SECRET
openssl rand -base64 32

# Example output:
# abc123xyz789/abc+def==ghi123jkl456mno789pqr==stu123vwx456yz
```

---

## Step-by-Step Vercel Deployment

### Step 1: Create Vercel Project
```bash
# Option A: Via Vercel Dashboard (Recommended)
1. Visit https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Click "Import"

# Option B: Via CLI
npm i -g vercel
vercel
```

### Step 2: Configure Environment Variables

In Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add the following variables:

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
NEXTAUTH_SECRET = <your-generated-secret-key>
NEXTAUTH_URL = https://your-vercel-domain.com
GOOGLE_CLIENT_ID = <your-google-client-id>
GOOGLE_CLIENT_SECRET = <your-google-client-secret>
```

**⚠️ IMPORTANT NOTES:**
- `NEXTAUTH_URL` must NOT have a trailing slash
- `NEXTAUTH_URL` must exactly match your production domain
- Replace `your-vercel-domain.com` with actual domain (e.g., `edwom-online.vercel.app`)
- For custom domains, use your custom domain instead

### Step 3: Configure Build Settings

In Vercel Project Settings → Build & Development Settings:
```
Framework Preset: Next.js
Build Command: next build --turbopack
Output Directory: .next (default)
Install Command: npm install (default)
Development Command: npm run dev (default)
```

### Step 4: Update Google OAuth Redirect URIs

If using custom domain instead of Vercel domain:

1. Go to Google Cloud Console
2. Find your OAuth 2.0 Client ID
3. Click to edit
4. Add authorized redirect URI:
   ```
   https://your-custom-domain.com/api/auth/callback/google
   ```
5. Save

### Step 5: Deploy

```bash
# Option A: Push to GitHub (Auto-Deploy)
git add .
git commit -m "Fix authentication system"
git push origin main

# Vercel automatically builds and deploys on push

# Option B: Manual Deploy via CLI
vercel --prod
```

### Step 6: Wait for Build Complete
- Monitor build in Vercel Dashboard
- Typical build time: 2-3 minutes
- Check build logs if errors occur
- Production URL: `https://your-project.vercel.app`

---

## Post-Deployment Testing

### Test 1: Application Loads
```
1. Visit https://your-domain.com
2. Should see landing page
3. Check browser console for errors
```

### Test 2: Authentication Works
```
1. Navigate to https://your-domain.com/api/auth/signin
2. You should see NextAuth sign-in interface
3. Test with temporary test account
```

### Test 3: Sign-Up Flow
```bash
curl -X POST https://your-domain.com/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "name": "Test User"
  }'

# Expected response:
{
  "message": "User created successfully",
  "user": {
    "id": "65abc123...",
    "email": "test@example.com",
    "name": "Test User",
    "role": "user"
  }
}
```

### Test 4: Session Check
```bash
curl https://your-domain.com/api/signin

# Expected response (not authenticated):
{
  "message": "Not authenticated",
  "authenticated": false
}
```

### Test 5: Google OAuth
```
1. Click "Sign in with Google" button
2. Redirect to Google login
3. Grant permissions
4. Should redirect back to application
5. Check MongoDB for new user record
```

### Test 6: Check Database
```
1. Go to MongoDB Atlas
2. Navigate to your cluster
3. Click "Browse Collections"
4. Check "users" collection
5. Verify test users were created
6. Check fields: email, name, role, isEmailVerified
```

### Test 7: Admin Access
```bash
# Get session with admin user (after manually setting role in MongoDB)
curl https://your-domain.com/api/admin/users

# Expected response (if not admin):
{
  "message": "Forbidden - Admin access required"
}

# Create admin user (via MongoDB):
# Update user document: { "role": "admin" }
```

---

## Troubleshooting Deployment Issues

### Issue: Build Fails with "Cannot find module"
**Solution:**
1. Check imports use `@/` alias
2. Verify `tsconfig.json` has correct paths
3. Check all files exist in project
4. Rebuild: `next build --turbopack` locally first

### Issue: Blank Page at Root
**Solution:**
1. Check `src/app/page.tsx` exists
2. Check `src/app/layout.tsx` is valid
3. View Vercel logs for errors
4. Check browser console for runtime errors

### Issue: "NEXTAUTH_URL not set" Error
**Solution:**
1. Go to Vercel Project Settings → Environment Variables
2. Add `NEXTAUTH_URL=https://your-domain.com` (no trailing slash)
3. Redeploy project

### Issue: Google OAuth Redirect Error
**Solution:**
1. Verify redirect URI in Google Cloud Console:
   ```
   https://your-domain.com/api/auth/callback/google
   ```
2. Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel
3. For custom domains, add that domain in Google Console too

### Issue: MongoDB Connection Timeout
**Solution:**
1. Verify `MONGODB_URI` is correct in Vercel env vars
2. Check MongoDB Atlas allows connections from Vercel IPs
3. In MongoDB Atlas:
   - Go to Network Access
   - Add IP Address: 0.0.0.0/0 (allows all IPs, or specific Vercel IPs)
4. Test connection locally: `mongo <MONGODB_URI>`

### Issue: Sessions Not Persisting
**Solution:**
1. Check `NEXTAUTH_SECRET` is set (must be 32+ characters)
2. Verify `NEXTAUTH_URL` matches your domain exactly
3. Clear browser cookies and retry
4. Check browser console for cookie errors

### Issue: Authentication Works Locally But Not on Vercel
**Solution:**
1. Compare local `.env.local` with Vercel env vars
2. Test with simple curl commands first
3. Check Vercel function logs: Project → Deployments → Latest → Functions
4. Verify all 5 env vars are set (don't skip optional ones)

---

## Monitoring & Maintenance

### Enable Vercel Analytics (Optional)
```
1. Vercel Dashboard → Settings → Analytics
2. Click "Enable Web Analytics"
3. View real-time traffic in Insights tab
```

### Monitor Function Logs
```
1. Vercel Dashboard → Deployments → Latest
2. Click "Functions" tab
3. See logs for `/api/*` endpoints
4. Check for errors in function execution
```

### Set Up Error Alerts
```
1. Vercel Dashboard → Settings → Git & Deployment
2. Enable "Automatic Failed Deployment Alerts"
3. Get email on build failures
```

### Regular Maintenance
```
Weekly:
- Check Vercel deployment logs for errors
- Verify application functionality
- Monitor database usage in MongoDB Atlas

Monthly:
- Review user data in MongoDB
- Check for failed API requests
- Update dependencies: npm outdated
- Rotate NEXTAUTH_SECRET (optional)
```

---

## Custom Domain Setup (Optional)

### Add Custom Domain to Vercel
```
1. Vercel Dashboard → Project Settings → Domains
2. Click "Add Domain"
3. Enter your custom domain (e.g., grocery.example.com)
4. Choose DNS provider:
   a) Nameservers (Recommended)
   b) A Record (Alternative)
5. Update domain registrar DNS records
6. Wait for DNS propagation (5-48 hours)
```

### Update NextAuth for Custom Domain
```
1. Vercel Project Settings → Environment Variables
2. Update NEXTAUTH_URL=https://your-custom-domain.com
3. Update Google OAuth redirect URIs to custom domain
4. Redeploy project
```

### Set Up SSL Certificate (Automatic)
- Vercel automatically provides free SSL certificate via Let's Encrypt
- Typically takes 24 hours
- Certificate auto-renews every 30 days

---

## Rollback to Previous Version

If deployment breaks:
```
1. Vercel Dashboard → Deployments
2. Find last known good deployment
3. Click the deployment
4. Click "Promote to Production"
5. Revert environment variables if needed
```

---

## Next Steps After Deployment

### Phase 1: Verify (Today)
- [x] Deployment completes successfully
- [x] Application loads
- [x] Authentication works
- [x] MongoDB connection stable

### Phase 2: Build Frontend (This Week)
- [ ] Create landing page with sign-up/login UI
- [ ] Build product browse pages
- [ ] Implement search and filters
- [ ] Create shopping cart

### Phase 3: Build Admin (Next Week)
- [ ] Create admin dashboard
- [ ] Product management interface
- [ ] Order management interface
- [ ] Create first admin user

### Phase 4: Launch Features (Following Weeks)
- [ ] Order checkout flow
- [ ] Payment integration
- [ ] Order tracking
- [ ] User notifications

---

## Quick Reference

### URLs After Deployment
```
Production: https://your-domain.com
Sign-In UI: https://your-domain.com/api/auth/signin
Session Check: https://your-domain.com/api/signin
Sign-Up Endpoint: POST https://your-domain.com/api/signup
Admin Users API: https://your-domain.com/api/admin/users
```

### Environment Variables Summary
```
MONGODB_URI          → MongoDB connection string
NEXTAUTH_SECRET      → JWT signing key (32+ chars)
NEXTAUTH_URL         → Your production domain (no trailing slash)
GOOGLE_CLIENT_ID     → From Google Cloud Console
GOOGLE_CLIENT_SECRET → From Google Cloud Console
```

### Common Commands
```bash
# Deploy latest code
git push origin main

# View logs
vercel logs --tail

# Environment variables
vercel env list
vercel env pull

# Rollback
vercel rollback
```

---

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **NextAuth Docs:** https://next-auth.js.org/deployment
- **MongoDB Atlas Docs:** https://docs.mongodb.com/atlas/
- **Google OAuth Guide:** https://developers.google.com/identity/protocols/oauth2

**Status:** ✅ Ready to Deploy

When you're ready, follow the steps above and your EdwomOnline application will be live! 🚀
