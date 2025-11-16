# Login Pages - Visual Mockups & Code Structure

## Page Layouts

### 1. Landing Page (`/`)

```
┌────────────────────────────────────────────────────────────┐
│  🛒 Edwom Online  │  Shop  Packages  About  │  Sign In  Sign Up
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────┐       │
│  │  Fresh Groceries Delivered to Your Doorstep     │       │
│  │  Shop from home, get fresh quality groceries    │       │
│  │                                                  │       │
│  │  [Get Started]  [Sign In]                       │       │
│  │                                                  │  🛒   │
│  │                            🥗🥕🍎              │  🥗   │
│  └─────────────────────────────────────────────────┘       │
│                                                             │
├────────────────────────────────────────────────────────────┤
│  Why Choose Edwom Online?                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 🚚       │  │ 🛍️      │  │ 👨‍🍳     │  │ ✨       │  │
│  │Fast      │  │Wide      │  │Meal      │  │Quality   │  │
│  │Delivery  │  │Selection │  │Packages  │  │Guaranteed│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
├────────────────────────────────────────────────────────────┤
│  Shop by Category                                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ 🍎   │ │ 🥕   │ │ 🍗   │ │ 🥛   │ │ 🌶️  │ │ 🌾   │  │
│  │Fruits│ │Veggies│ │Meats │ │Dairy │ │Spices│ │Grains│  │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘  │
│                                                             │
├────────────────────────────────────────────────────────────┤
│  Ready to Start Shopping?                                  │
│  [Create Account]  [Sign In]                               │
│                                                             │
│  Admin? [Admin Login]                                      │
└────────────────────────────────────────────────────────────┘
```

---

### 2. User Login Page (`/auth/login`)

```
┌─────────────────────┬─────────────────────────────┐
│                     │                             │
│  🛒 Edwom Online    │  Welcome to Edwom Online    │
│  Your convenient    │  Sign in to your account    │
│  grocery delivery   │  or create a new one        │
│  solution           │                             │
│                     │  ┌─────────────────────┐   │
│  🚚 Fast Delivery   │  │ Email Address       │   │
│     Delivered to    │  │ your@email.com      │   │
│     your doorstep   │  └─────────────────────┘   │
│                     │                             │
│  🛍️  Wide Selection │  ┌─────────────────────┐   │
│      Browse         │  │ Password      × Reset│   │
│      thousands      │  │ ••••••••            │   │
│                     │  └─────────────────────┘   │
│  👨‍🍳 Meal Packages   │                             │
│     Pre-curated     │  [Sign In]                  │
│     with recipes    │                             │
│                     │  ─────── Or continue ──────│
│  ✨ Quality         │                             │
│     Guaranteed      │  [Google Sign In]           │
│                     │                             │
│                     │  Don't have an account?     │
│ © 2025 Edwom Online │  Sign up here               │
│                     │                             │
└─────────────────────┴─────────────────────────────┘
```

---

### 3. User Sign-Up Page (`/auth/signup`)

```
┌─────────────────────┬─────────────────────────────┐
│                     │                             │
│  🛒 Edwom Online    │  Create Your Account        │
│  (branding info)    │  Join and start shopping    │
│                     │                             │
│                     │  ┌─────────────────────┐   │
│                     │  │ Full Name           │   │
│                     │  │ John Doe            │   │
│                     │  └─────────────────────┘   │
│                     │                             │
│                     │  ┌─────────────────────┐   │
│                     │  │ Email Address       │   │
│                     │  │ your@email.com      │   │
│                     │  └─────────────────────┘   │
│                     │                             │
│                     │  ┌─────────────────────┐   │
│                     │  │ Password            │   │
│                     │  │ ••••••••  (6+ chars)│   │
│                     │  └─────────────────────┘   │
│                     │                             │
│                     │  ┌─────────────────────┐   │
│                     │  │ Confirm Password    │   │
│                     │  │ ••••••••            │   │
│                     │  └─────────────────────┘   │
│                     │                             │
│                     │  ☑ I agree to Terms &      │
│                     │    Privacy Policy          │
│                     │                             │
│                     │  [Create Account]           │
│                     │                             │
│                     │  Already have an account?   │
│                     │  Sign in here               │
│                     │                             │
└─────────────────────┴─────────────────────────────┘
```

---

### 4. Admin Login Page (`/auth/admin-login`)

```
┌─────────────────────┬─────────────────────────────┐
│                     │                             │
│  🛒 Edwom Online    │  Admin Login                │
│  (branding info)    │  Sign in to your account    │
│                     │                             │
│                     │  ┌─────────────────────┐   │
│                     │  │ Email Address       │   │
│                     │  │ admin@email.com     │   │
│                     │  └─────────────────────┘   │
│                     │                             │
│                     │  ┌─────────────────────┐   │
│                     │  │ Password            │   │
│                     │  │ ••••••••            │   │
│                     │  └─────────────────────┘   │
│                     │                             │
│                     │  [Sign In]                  │
│                     │                             │
│                     │  If you need admin access,  │
│                     │  please contact your        │
│                     │  administrator.             │
│                     │                             │
│                     │  (No Google OAuth button)   │
│                     │                             │
└─────────────────────┴─────────────────────────────┘
```

---

### 5. Admin Dashboard (`/admin/dashboard`)

```
┌────────────────────────────────────────────────────────────┐
│  🛒 Edwom Online  │  Home  Items  Orders  Users  Settings  │
│                                  │ Admin ↓  Sign Out       │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Admin Dashboard                                           │
│  Welcome back, John Doe                                    │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │    0     │ │    0     │ │    0     │ │   $0     │     │
│  │ Orders   │ │Completed │ │ Pending  │ │ Revenue  │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ 📦       │ │ 🛒      │ │ 👥       │                   │
│  │ Items    │ │ Orders   │ │ Users    │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ 📦       │ │ ⚙️      │ │ 📊      │                   │
│  │ Packages │ │ Settings │ │ Analytics│                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
│                                                             │
│  🚀 Coming Soon                                            │
│  Full admin dashboard features coming soon...             │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

### 6. Header (Global)

```
Unauthenticated:
┌────────────────────────────────────────────────────────────┐
│ 🛒 Edwom Online  │  Shop  Packages  About  │  Sign In  Sign Up
└────────────────────────────────────────────────────────────┘

Authenticated (Regular User):
┌────────────────────────────────────────────────────────────┐
│ 🛒 Edwom Online  │  Shop  Packages  About  │  [Avatar] John  Sign Out
└────────────────────────────────────────────────────────────┘

Authenticated (Admin):
┌────────────────────────────────────────────────────────────┐
│ 🛒 Edwom Online  │  Shop  Packages  About  │  [Dashboard]  [Admin]  John  Sign Out
└────────────────────────────────────────────────────────────┘

Mobile (Hamburger):
┌────────────────────────────────────────────────────────────┐
│ 🛒 Edwom Online                              ☰ (menu icon)
├────────────────────────────────────────────────────────────┤
│ Shop                                                        │
│ Packages                                                    │
│ About                                                       │
│ [Admin Dashboard]  (if admin)                              │
│ Sign Out  (if authenticated)                               │
│ Sign In / Sign Up  (if not authenticated)                  │
└────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
_app.tsx (SessionProvider + Header wrapper)
│
├─ Header (Global navigation)
│
└─ Component/Page
   │
   ├─ Pages without auth:
   │  ├─ page.tsx (Landing)
   │  ├─ auth/login.tsx (LoginForm + AuthLayout)
   │  ├─ auth/signup.tsx (SignUpForm + AuthLayout)
   │  └─ auth/admin-login.tsx (LoginForm + AuthLayout)
   │
   └─ Pages with auth:
      ├─ admin/dashboard.tsx (ProtectedRoute + AdminDashboardContent)
      └─ (future: /user/profile, /user/orders, etc.)
```

---

## User Flow Diagram

```
User Visits App
│
├─ If not authenticated:
│  │
│  ├─ Visits / (landing page)
│  │  └─ Sees: Hero, features, sign up CTA
│  │
│  ├─ Clicks "Sign Up"
│  │  └─ Goes to /auth/signup
│  │     ├─ Fills form (name, email, password)
│  │     └─ Account created, redirects to /auth/login
│  │
│  ├─ Clicks "Sign In"
│  │  └─ Goes to /auth/login
│  │     ├─ Option 1: Email/password
│  │     │  └─ Authenticated, redirected to /
│  │     │
│  │     └─ Option 2: Google OAuth
│  │        ├─ New user? Auto-created in DB
│  │        └─ Authenticated, redirected to /
│  │
│  └─ Admin clicks "Admin Login"
│     └─ Goes to /auth/admin-login
│        ├─ Enters admin email/password
│        ├─ If role !== 'admin': Error message
│        └─ If role === 'admin': Redirect to /admin/dashboard
│
└─ If authenticated:
   │
   ├─ Header shows user info
   │  ├─ User name
   │  ├─ User role (user/admin)
   │  ├─ Sign Out button
   │  └─ If admin: Admin Dashboard link
   │
   ├─ Can access protected routes
   │
   └─ When signing out
      └─ Cleared JWT cookie
         └─ Redirected to home
```

---

## State Flow

```
User State Machine:

┌─────────────────────┐
│  Loading            │
│ (Checking session)  │
└────────┬────────────┘
         │
         ├─ If JWT cookie valid:
         │  └─ Go to Authenticated
         │
         └─ If no JWT cookie:
            └─ Go to Not Authenticated

┌──────────────────────────────┐
│  Not Authenticated           │
│ (Can access: /, /auth/*)     │
│ (Cannot access: /admin/*)    │
└────────┬─────────────────────┘
         │
         ├─ User signs up → Create account → Login
         │
         ├─ User signs in → JWT created → Go to Authenticated
         │
         └─ Admin tries /admin/* → Redirect to /auth/admin-login

┌──────────────────────────────┐
│  Authenticated (User)        │
│ (Can access: /, /auth/*)     │
│ (Cannot access: /admin/*)    │
└────────┬─────────────────────┘
         │
         ├─ Access /admin/* → Redirect to /
         │
         └─ Sign out → Clear JWT → Go to Not Authenticated

┌──────────────────────────────┐
│  Authenticated (Admin)       │
│ (Can access: /, /auth/*, /admin/*) │
└────────┬─────────────────────┘
         │
         ├─ Can access /admin/dashboard
         │
         └─ Sign out → Clear JWT → Go to Not Authenticated
```

---

## Form Validation Flow

### Sign-Up Form
```
User Input
  ↓
Client-side validation:
  ├─ Name: Required, non-empty
  ├─ Email: Valid format (regex)
  ├─ Password: ≥ 6 characters
  ├─ Confirm: Matches password
  └─ Terms: Must be checked
  ↓
If validation fails: Show error message
If validation passes:
  ↓
  POST /api/signup
    ↓
    Server validation & create user
    ↓
  201 Success or error response
    ↓
  Show success message
  ↓
  Redirect to login after 2 seconds
```

### Login Form
```
User Input (Email + Password)
  ↓
No client-side validation (simple validation)
  ↓
signIn('credentials', {...})
  ↓
NextAuth Credentials Provider:
  ├─ Query DB for user
  ├─ Verify password hash
  ├─ Generate JWT token
  └─ Store in HTTP-only cookie
  ↓
If success:
  └─ Redirect to / or callback URL
If failure:
  └─ Show error message
```

---

## Color Scheme

```
Primary Color (Buttons, Links):
- Used for: CTA buttons, "Sign In", links
- Hex: var(--primary) from globals.css
- States: 
  - Default: Full color
  - Hover: Slightly darker (primary/90)
  - Disabled: 50% opacity

Gray Scale (Text, Backgrounds):
- gray-900: Headings, main text
- gray-600: Secondary text, descriptions
- gray-300: Borders, dividers
- gray-50: Light backgrounds

Status Colors:
- Red: Errors (#EF4444)
- Green: Success (#22C55E)
- Orange: Warnings (#F97316)
```

---

## Responsive Breakpoints

```
Mobile (< 768px):
- Hamburger menu
- Stacked layout on auth pages
- Single column for content
- Larger touch targets

Tablet (768px - 1024px):
- Responsive grid (2-3 columns)
- Mix of hamburger and desktop menu

Desktop (> 1024px):
- Full horizontal nav
- Split layouts on auth pages
- 4-column grids
- Full sidebar support (future)
```

---

## Next Steps

1. ✅ **Login pages built** - Ready to test
2. ✅ **Styled with Tailwind** - Responsive design
3. ✅ **Connected to API** - Uses real auth endpoints
4. ⏳ **Deploy to Vercel** - Follow deployment guide
5. ⏳ **Build product pages** - Add /products, /cart
6. ⏳ **Build admin features** - Add /admin/items, /admin/orders

---

**Status: Ready for Testing!** 🚀

Start with:
```bash
npm run dev
# Visit http://localhost:3000
```
