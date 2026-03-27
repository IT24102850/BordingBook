# BoardingBook — Admin Module Checklist

## How to Run the Project

```bash
# 1. Start backend
cd backend
npm install          # only needed once
npm run dev          # runs on http://localhost:5000

# 2. Seed the admin account (only needed ONCE ever)
node src/admin/seed.js

# 3. Start frontend (separate terminal)
cd frontend
npm install          # only needed once
npm run dev          # runs on http://localhost:5173
```

> **Admin login URL:** http://localhost:5173/admin/login
> **Default credentials:** admin@boardingbook.com / Admin@1234
> **Change the password after first login!**

---

## Project Structure

```
BordingBook/
├── backend/
│   ├── src/
│   │   ├── admin/              ← All admin backend code (your work)
│   │   │   ├── models/
│   │   │   │   ├── Admin.js
│   │   │   │   ├── SupportTicket.js
│   │   │   │   └── Review.js
│   │   │   ├── controllers/
│   │   │   │   ├── authController.js
│   │   │   │   ├── userController.js
│   │   │   │   ├── ticketController.js
│   │   │   │   └── reviewController.js
│   │   │   ├── middleware/
│   │   │   │   └── adminAuth.js
│   │   │   ├── routes/
│   │   │   │   └── index.js
│   │   │   └── seed.js
│   │   ├── models/User.js      ← Shared (added isBanned, kycStatus fields)
│   │   ├── routes/authRoutes.js
│   │   └── app.js
│   └── package.json
├── frontend/
│   └── src/app/components/admin/
│       ├── api.ts              ← All API calls to backend
│       ├── AdminLayout.tsx     ← Sidebar + auth guard
│       └── AdminScreens.tsx    ← All 5 admin pages (live data)
└── CHECKLIST.md                ← This file
```

---

## MongoDB Collections Used

| Collection      | Purpose                                    |
|-----------------|--------------------------------------------|
| `admins`        | Admin accounts                             |
| `users`         | Students & Owners (managed by admin)       |
| `supporttickets`| Support tickets from users                 |
| `reviews`       | Platform reviews submitted by users        |

---

## API Endpoints (all under /api/admin)

| Method | Endpoint                    | Auth | Description                    |
|--------|-----------------------------|------|--------------------------------|
| POST   | /login                      | No   | Admin login → returns JWT      |
| GET    | /me                         | Yes  | Get current admin profile      |
| GET    | /stats                      | Yes  | Dashboard counts               |
| GET    | /users                      | Yes  | List students & owners         |
| GET    | /users/:id                  | Yes  | Get single user                |
| PATCH  | /users/:id/ban              | Yes  | Ban a user                     |
| PATCH  | /users/:id/unban            | Yes  | Unban a user                   |
| GET    | /kyc?status=pending         | Yes  | KYC submissions by status      |
| PATCH  | /kyc/:id/approve            | Yes  | Approve KYC                    |
| PATCH  | /kyc/:id/reject             | Yes  | Reject KYC                     |
| GET    | /tickets/stats              | Yes  | Ticket counts by status        |
| GET    | /tickets                    | Yes  | List all support tickets       |
| GET    | /tickets/:id                | Yes  | Get single ticket              |
| PATCH  | /tickets/:id/status         | Yes  | Update ticket status           |
| POST   | /tickets/:id/reply          | Yes  | Admin reply to ticket          |
| GET    | /reviews/stats              | Yes  | Review counts                  |
| GET    | /reviews                    | Yes  | List all reviews               |
| PATCH  | /reviews/:id/flag           | Yes  | Flag a review                  |
| PATCH  | /reviews/:id/unflag         | Yes  | Unflag a review                |
| DELETE | /reviews/:id                | Yes  | Delete a review                |

---

## Completed ✅

- [x] Project file structure cleaned and reorganized
  - [x] Root-level frontend files moved to `frontend/`
  - [x] Stray images and favicons consolidated
  - [x] Junk scripts deleted (parse_tsx, print_all, test.txt)
- [x] Admin backend module (`backend/src/admin/`)
  - [x] Admin model + seed script
  - [x] SupportTicket model
  - [x] Review model
  - [x] User model updated (isBanned, kycStatus, kycDocuments fields)
  - [x] JWT auth middleware (adminAuth.js)
  - [x] Auth controller (login, getMe)
  - [x] User controller (list, ban, unban, KYC approve/reject, stats)
  - [x] Ticket controller (list, get, reply, status update, stats)
  - [x] Review controller (list, flag, unflag, delete, stats)
  - [x] Admin routes mounted at /api/admin
- [x] Admin frontend connected to real backend
  - [x] api.ts utility with all endpoints + shared types
  - [x] AdminLogin → real JWT login
  - [x] AdminDashboard → live stats
  - [x] UserManagement → live users, real ban/unban, side-by-side Students/Owners panels
  - [x] KYCVerification → live KYC list, real approve/reject, clickable document links
  - [x] SupportTickets → live tickets, real reply + resolve
  - [x] FeedbackManagement → live reviews, real flag/delete
  - [x] AdminLayout auth guard updated to use JWT token
  - [x] Admin Settings page — password change form at /admin/settings
- [x] Student Sign Up
  - [x] Full sign-up form (StudentID → auto email, NIC, academic year, birthday, password)
  - [x] SLIIT email format validated from student ID prefix
  - [x] Redirects to VerifyEmailPage after sign-up
  - [x] VerifyEmailPage connected to GET /api/auth/verify-email?token=
  - [x] Auto-delete unverified students — TTL index on `verificationTokenExpiry` (24h)
- [x] Owner Sign Up
  - [x] Owner sign-up form (full name, email, phone, company, property count, password)
  - [x] KYC document upload (POST /api/kyc/submit) — NIC front/back + selfie
  - [x] GET /api/kyc/status — owner checks own KYC status
  - [x] KYC banner in OwnerDashboard (not_submitted / pending / rejected states)
  - [x] KYC upload modal with file pickers for all 3 documents
  - [x] Owners auto-verified on signup (no email verification step)
  - [x] Owner signup flow: success screen → KYC upload or skip
  - [x] Password strength indicator + fixed auto-advance bug
- [x] User Sign In
  - [x] SignInPage wired to POST /api/auth/signin
  - [x] Stores userToken, userRole, userName in localStorage
  - [x] Redirect students → /student/dashboard, owners → /owner/dashboard
- [x] Student Dashboard — review + support ticket modals
- [x] Owner Dashboard — review + support ticket modals
- [x] Review Submission — POST /api/user/reviews (userAuth), shows in admin FeedbackManagement
- [x] Support Ticket Submission — POST /api/user/tickets (userAuth), shows in admin SupportTickets
- [x] Admin Password Change — PATCH /api/admin/password
- [x] User Monitoring / Activity Log
  - [x] lastSeen / lastLogin tracking on User model
  - [x] GET /api/admin/users/:id/activity — login history
  - [x] Activity timeline in user detail modal
- [x] Forgot Password
  - [x] POST /api/auth/forgot-password — generates reset token, sends email
  - [x] POST /api/auth/reset-password — validates token, resets password
  - [x] ForgotPasswordPage.tsx + ResetPasswordPage.tsx
  - [x] Email delivery via Resend — DEV_TEST_EMAIL=jaliyathegreat@gmail.com; custom domain pending
- [x] Environment / Security
  - [x] CORS origin restriction (ALLOWED_ORIGINS env var)
  - [x] MongoDB Atlas cluster in use
  - [x] .env.example added
  - [x] Rate limiting on auth endpoints (express-rate-limit, 20 req / 15 min per IP)

---

## Remaining 🔲

### Environment / Deployment
- [ ] Update vercel.json for frontend deployment (when deploying to Vercel)

### Mailing
- [ ] Swap `onboarding@resend.dev` sender to custom domain once DNS is confirmed in Resend
