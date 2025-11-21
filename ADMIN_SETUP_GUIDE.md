# Admin User Management Guide

## 🔐 Creating the Super Admin

### Step 1: Seed the Admin User

Run the seed script to create the initial super admin:

```bash
npm run seed:admin
```

### Step 2: Output

You'll see this output:

```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB
🔐 Hashing password...
👤 Creating super admin user...

✅ Super Admin Created Successfully!

═══════════════════════════════════════
📧 Email:    admin@edwom.com
🔑 Password: Admin@123456
👤 Name:     Super Admin
👑 Role:     admin
═══════════════════════════════════════

📝 Next Steps:
1. Start dev server: npm run dev
2. Go to http://localhost:3000/auth/admin-login
3. Enter the email and password above
4. You should see the admin dashboard
5. Use the admin panel to create other admins

⚠️  SECURITY NOTE:
⚠️  Change this admin password after first login!
⚠️  Do NOT use these credentials in production!
```

### Step 3: Login as Admin

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/auth/admin-login`

3. Enter the credentials:
   - **Email:** `admin@edwom.com`
   - **Password:** `Admin@123456`

4. You should see the admin dashboard at `/admin/dashboard`

---

## 👥 Creating Additional Admins

### Via Admin Panel (Coming Soon)

Once you log in as the super admin, you'll have access to the admin dashboard where you can:
- View all users (`/admin/users`)
- Change user roles (promote/demote to admin)
- Manage user accounts

### Via MongoDB (Manual - For Now)

Until the admin panel is built, you can manually make users admins by updating the MongoDB database:

**Option 1: Using MongoDB Atlas UI**

1. Log into MongoDB Atlas (https://cloud.mongodb.com)
2. Navigate to your cluster → Collections → edwom-online.users
3. Find the user you want to promote
4. Edit the user document
5. Change `"role": "user"` to `"role": "admin"`
6. Save the document

**Option 2: Using MongoDB CLI**

```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

**Option 3: Using Mongoose in Node.js**

```javascript
const User = require('./src/models/User');
User.findByIdAndUpdate(userId, { role: 'admin' }, { new: true });
```

---

## 🔑 Admin Credentials Management

### Changing Admin Password

1. Log in as the admin
2. Look for "Settings" or "Profile" section (coming soon)
3. Change your password there

**For now (manual via MongoDB):**
- Hash the new password with bcrypt
- Update the `passwordHash` field in MongoDB

```javascript
const bcrypt = require('bcrypt');
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash('newpassword123', salt);
// Update user.passwordHash = hash in MongoDB
```

### Resetting Admin Password

If you forget the admin password, you can reseed:

```bash
# First delete the admin user from MongoDB
db.users.deleteOne({ email: "admin@edwom.com" })

# Then run the seed script again
npm run seed:admin
```

---

## 🛡️ Security Best Practices

### ✅ DO:

- **Change the default admin password immediately** after first login
- **Use strong passwords** (16+ characters, mixed case, numbers, symbols)
- **Rotate admin passwords regularly** (every 90 days)
- **Restrict admin access** by IP (in production, use MongoDB IP whitelist)
- **Use HTTPS** in production (Vercel provides this by default)
- **Monitor admin activity** (log all admin actions)
- **Use 2FA** when available (coming soon)

### ❌ DON'T:

- **Never hardcode admin credentials** in your code
- **Never use the default password in production**
- **Never share admin credentials** via email/chat
- **Never store plaintext passwords** anywhere
- **Never reuse passwords** across services
- **Never give admin access to untrustworthy users**

---

## 📋 Admin Roles & Permissions

### Current Admin Capabilities:

✅ View all users  
✅ Change user roles (promote to admin / demote to user)  
✅ Update user email verification status  

### Coming Soon:

📋 View orders  
📦 Manage products/items  
💰 View analytics  
📊 Export reports  
👥 Bulk user management  

---

## 🚨 Troubleshooting

### Seed Script Fails

**Error: `MONGODB_URI not found in environment variables`**
- Solution: Make sure your `.env.local` file has `MONGODB_URI` set

**Error: `Admin user already exists`**
- Solution: The admin@edwom.com already exists. Either:
  - Use different email (edit script)
  - Delete existing admin from MongoDB and reseed

### Can't Login as Admin

**Error: `Admin access required`**
- Your user doesn't have `role: "admin"` in MongoDB
- Update the user's role via MongoDB UI or CLI

**Error: `No user found`**
- The email doesn't exist in MongoDB
- Run `npm run seed:admin` again

---

## 📱 For Production

### On Vercel:

1. **Generate strong NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

2. **Set environment variables in Vercel:**
   - `MONGODB_URI` - Your production MongoDB URI
   - `NEXTAUTH_SECRET` - Your generated secret
   - `NEXTAUTH_URL` - Your production domain
   - All other vars from `.env.local`

3. **Seed the production admin:**
   ```bash
   # Via Vercel CLI:
   vercel env pull
   npm run seed:admin
   
   # Or manually add user via MongoDB Atlas UI
   ```

4. **Change default credentials immediately**

5. **Enable IP whitelist** in MongoDB for your Vercel deployment

---

## 🔗 Related Files

- **Seed Script:** `scripts/seed-admin.ts`
- **User Model:** `src/models/User.ts`
- **Admin API:** `src/app/api/admin/users/route.ts`
- **Admin Dashboard:** `src/app/admin/dashboard/page.tsx`
- **Auth Config:** `src/app/api/auth/[...nextauth]/route.ts`

---

**Questions?** Check `.github/copilot-instructions.md` for architecture details.
