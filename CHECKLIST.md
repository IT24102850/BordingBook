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
  - [x] UserManagement → live users, real ban/unban
  - [x] KYCVerification → live KYC list, real approve/reject
  - [x] SupportTickets → live tickets, real reply + resolve
  - [x] FeedbackManagement → live reviews, real flag/delete
  - [x] AdminLayout auth guard updated to use JWT token

---

## To Do — Next Steps 🔲

### Student Sign Up (Priority: High)
- [x] Frontend: Full student sign-up form exists (SignUpPage.tsx)
  - Fields: first name, last name, student ID → auto-builds IT########@my.sliit.lk email, NIC, academic year, birthday, password
  - SLIIT email format validated from student ID prefix
  - Redirects to VerifyEmailPage after sign-up
- [x] Backend: User model updated with student-specific fields
  - `firstName`, `lastName`, `studentId`, `nic`, `birthday`, `academicYear`
- [x] Backend: authController.signup saves student fields
- [x] Frontend: VerifyEmailPage connected to GET /api/auth/verify-email?token= (was already done)

### Owner Sign Up (Priority: High)
- [x] Frontend: Owner sign-up form exists in SignUpPage.tsx (role toggle)
  - Fields: full name, email, phone, company name, property count, password
- [x] Backend: KYC document upload endpoint (POST /api/kyc/submit)
  - multer accepts NIC front/back + selfie (JPG/PNG/PDF, max 5MB each)
  - Sets kycStatus = 'pending', records kycSubmittedAt
  - Files saved to backend/uploads/kyc/
- [x] Backend: GET /api/kyc/status — owner checks own KYC status
- [x] Backend: userAuth middleware for user JWT verification
- [x] Frontend: KYC banner in OwnerDashboard (not_submitted / pending / rejected states)
- [x] Frontend: KYC upload modal with file pickers for all 3 documents
- [x] Owner email verification removed — owners auto-verified on signup
- [x] Owner signup flow: step 2 = animated success screen → step 3 = KYC upload or skip

### User Sign In (Priority: High)
- [x] Frontend: SignInPage wired to POST /api/auth/signin
- [x] Stores userToken, userRole, userName in localStorage after login
- [x] Redirect students to /student/dashboard, owners to /owner/dashboard

### Review Submission by Users (Priority: Medium)
- [x] Frontend: "Write a Review" modal in StudentDashboard and OwnerDashboard
- [x] Backend: POST /api/user/reviews — create review (userAuth required)
- [x] Reviews show up in admin FeedbackManagement automatically

### Support Ticket Submission by Users (Priority: Medium)
- [x] Frontend: "Create Ticket" modal in StudentDashboard and OwnerDashboard
  - Fields: subject, category, description
- [x] Backend: POST /api/user/tickets — create ticket (userAuth required)
- [x] Backend: POST /api/user/tickets/:id/message — user reply to own ticket
- [x] Tickets show up in admin SupportTickets automatically

### Admin Password Change (Priority: Medium)
- [x] Backend: PATCH /api/admin/password — change admin password
- [x] Frontend: Settings page at /admin/settings with password change form

### User Monitoring / Activity Log (Priority: Low)
- [x] Backend: Add lastSeen / lastLogin tracking to User model
- [x] Backend: GET /api/admin/users/:id/activity — login history (last 20, newest first)
- [x] Frontend: Show activity timeline in user detail modal

### Frontend: Connect Sign In / Sign Up Pages (Priority: High)
- [x] SignInPage.tsx — connected to POST /api/auth/signin
- [x] SignUpPage.tsx — connected to POST /api/auth/signup
- [x] VerifyEmailPage.tsx — connected to GET /api/auth/verify-email?token=

### Forgot Password (Priority: High)
- [x] Backend: POST /api/auth/forgot-password — generates reset token, sends email
- [x] Backend: POST /api/auth/reset-password — validates token, resets password
- [x] Frontend: ForgotPasswordPage.tsx — email form with success state
- [x] Frontend: ResetPasswordPage.tsx — new password form, redirects to sign-in on success
- [ ] Email delivery — pending Resend mailing setup (DEV_TEST_EMAIL workaround available)

### Environment / Deployment (Priority: Low)
- [x] Add CORS origin restriction in backend (ALLOWED_ORIGINS env var, defaults to localhost:5173)
- [ ] Move MongoDB URI to a proper cloud instance (MongoDB Atlas)
- [x] Add .env.example file for backend
- [ ] Update vercel.json if deploying frontend separately
- [x] Add rate limiting to auth endpoints (express-rate-limit, 20 req / 15 min per IP)
