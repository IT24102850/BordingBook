# BoardingBook — API Test Log

**Base URL:** `http://localhost:5001`

---

## Resend Email Verification — Complete Guide

### How Resend Free Tier Works
- Free tier can ONLY deliver emails to addresses you verify in the Resend dashboard
- The `onboarding@resend.dev` sender is for testing only
- To send to ANY email (including SLIIT emails), you need to add a verified custom domain

### Step-by-Step: Testing Verification Email

#### Step 1 — Add your test email in Resend dashboard
1. Go to https://resend.com → sign in
2. Click **Audiences** → **Contacts** (or just go directly to sending)
3. Actually for free tier: go to your **API Keys** page and check what email you signed up with
4. Resend free tier delivers to your **own registered email only**
5. So use your Resend-registered email as the test recipient

#### Step 2 — Temporarily override the recipient for testing
Since student emails are `ITxxxxxxxx@my.sliit.lk` (can't receive on those during dev),
update `emailService.js` to send to your test email while developing:

```js
// In sendVerificationEmail — DEV OVERRIDE
const toEmail = process.env.NODE_ENV === 'development'
  ? process.env.DEV_TEST_EMAIL   // your real email
  : email;                        // actual user email in production
```

Add this to `backend/.env`:
```
DEV_TEST_EMAIL=your-registered-resend-email@gmail.com
```

#### Step 3 — Sign up a test student
```
POST http://localhost:5001/api/auth/signup
{
  "email": "IT21234567@my.sliit.lk",
  "password": "Test@1234",
  "role": "student",
  "firstName": "John",
  "lastName": "Doe",
  "studentId": "IT21234567",
  "nic": "200012345678",
  "birthday": "2000-01-01",
  "academicYear": "2"
}
```

#### Step 4 — Check email delivery
- Open your test inbox — you should receive the verification email
- OR go to https://resend.com → **Emails** tab — shows every send attempt and status

#### Step 5 — Extract the token (two ways)

**Way A — Click the link in the email**
The email contains a button linking to:
`http://localhost:5173/verify-email?token=XXXXXX`
Click it → the VerifyEmailPage auto-calls the backend → account verified 

**Way B — Get token from MongoDB (if email didn't arrive)**
1. Go to MongoDB Atlas → `users` collection
2. Find the user → copy the `verificationToken` field value (it's a hashed token)
   > NOTE: The token in MongoDB is SHA-256 hashed. You need the raw token from the email URL.
   > Instead, use Way C below.

**Way C — Get raw token from backend logs**
Add a temporary console.log in `authController.js` signup function:
```js
const verificationToken = user.generateVerificationToken();
console.log('DEV TOKEN:', verificationToken); // remove before production
await user.save();
```
Then call the verify endpoint directly:
```
GET http://localhost:5001/api/auth/verify-email?token=PASTE_RAW_TOKEN_HERE
```

#### Step 6 — Confirm verification worked
```
POST http://localhost:5001/api/auth/signin
{ "email": "IT21234567@my.sliit.lk", "password": "Test@1234" }

Expected: 200 with JWT token (not 403)
```

---

### For Production (when going live)
1. Go to https://resend.com → **Domains** → Add your domain
2. Add the DNS records they give you to your domain provider
3. Once verified, change the `from` in `emailService.js`:
   ```js
   const FROM = 'BoardingBook <noreply@yourdomain.com>';
   ```
4. Remove the `DEV_TEST_EMAIL` override
5. Emails will now deliver to ALL addresses including `@my.sliit.lk`

---

## Utility Commands

```bash
# Delete a specific user
node src/admin/deleteUser.js IT21234567@my.sliit.lk

# Delete ALL test users (keeps admin)
node -e "require('dotenv').config(); const mongoose=require('mongoose'); const User=require('./src/models/User'); mongoose.connect(process.env.MONGO_URI).then(async()=>{ await User.deleteMany({role:{$in:['student','owner']}}); console.log('done'); process.exit(0); });"
```

---

## Auth Endpoints  `POST /api/auth`

### 1. Student Sign Up
```
POST http://localhost:5001/api/auth/signup
Content-Type: application/json

{
  "email": "IT21234567@my.sliit.lk",
  "password": "Test@1234",
  "role": "student",
  "firstName": "John",
  "lastName": "Doe",
  "studentId": "IT21234567",
  "nic": "200012345678",
  "birthday": "2000-01-01",
  "academicYear": "2"
}

Expected: 201 { success: true, data: { userId, email, role, isVerified: false } }
```

### 2. Owner Sign Up
```
POST http://localhost:5001/api/auth/signup
Content-Type: application/json

{
  "email": "owner@gmail.com",
  "password": "Owner@1234",
  "role": "owner",
  "fullName": "Jane Smith",
  "phoneNumber": "0771234567"
}

Expected: 201 { success: true, data: { userId, email, role, isVerified: false } }
```

### 3. Resend Verification Email
```
POST http://localhost:5001/api/auth/resend-verification
Content-Type: application/json

{ "email": "IT21234567@my.sliit.lk" }

Expected: 200 { success: true, message: "Verification email sent successfully" }
```

### 4. Verify Email (get token from email link)
```
GET http://localhost:5001/api/auth/verify-email?token=PASTE_TOKEN_HERE

Expected: 200 { success: true, message: "Email verified successfully..." }
```

### 5. Sign In (unverified — should fail)
```
POST http://localhost:5001/api/auth/signin
Content-Type: application/json

{ "email": "IT21234567@my.sliit.lk", "password": "Test@1234" }

Expected: 403 { success: false, message: "Please verify your email...", needsVerification: true }
```

### 6. Sign In (verified — should succeed)
```
POST http://localhost:5001/api/auth/signin
Content-Type: application/json

{ "email": "IT21234567@my.sliit.lk", "password": "Test@1234" }

Expected: 200 { success: true, data: { token, user: { id, email, role } } }
```

---

## Admin Endpoints  `POST /api/admin`

### 7. Admin Login
```
POST http://localhost:5001/api/admin/login
Content-Type: application/json

{ "email": "admin@boardingbook.com", "password": "Admin@1234" }

Expected: 200 { success: true, data: { token, admin: { id, name, email } } }
```

> Copy the token from response — use it as Bearer token for all requests below.

### 8. Get Admin Profile
```
GET http://localhost:5001/api/admin/me
Authorization: Bearer <token>

Expected: 200 { success: true, data: { id, name, email, lastLogin } }
```

### 9. Dashboard Stats
```
GET http://localhost:5001/api/admin/stats
Authorization: Bearer <token>

Expected: 200 { data: { totalStudents, totalOwners, pendingKyc, bannedUsers } }
```

### 10. List Users
```
GET http://localhost:5001/api/admin/users
Authorization: Bearer <token>

# With filters:
GET http://localhost:5001/api/admin/users?role=student
GET http://localhost:5001/api/admin/users?search=john
GET http://localhost:5001/api/admin/users?page=2

Expected: 200 { data: { users: [...], total: N } }
```

### 11. Ban / Unban User
```
PATCH http://localhost:5001/api/admin/users/<userId>/ban
Authorization: Bearer <token>

PATCH http://localhost:5001/api/admin/users/<userId>/unban
Authorization: Bearer <token>

Expected: 200 { success: true }
```

### 12. KYC List
```
GET http://localhost:5001/api/admin/kyc?status=pending
Authorization: Bearer <token>

Expected: 200 { data: [ ...users with kycStatus=pending ] }
```

### 13. Support Ticket Stats
```
GET http://localhost:5001/api/admin/tickets/stats
Authorization: Bearer <token>

Expected: 200 { data: { open, in_progress, resolved, closed } }
```

### 14. Review Stats
```
GET http://localhost:5001/api/admin/reviews/stats
Authorization: Bearer <token>

Expected: 200 { data: { total, flagged, hidden } }
```

---

## Validation Tests (should fail)

### Wrong email format for student
```
POST http://localhost:5001/api/auth/signup
{ "email": "john@gmail.com", "password": "Test@1234", "role": "student" }

Expected: 400 { message: "Students must use @sliit.lk or @my.sliit.lk email" }
```

### Duplicate email
```
POST http://localhost:5001/api/auth/signup  (same email twice)

Expected: 409 { message: "An account with this email already exists" }
```

### Wrong admin password
```
POST http://localhost:5001/api/admin/login
{ "email": "admin@boardingbook.com", "password": "wrongpassword" }

Expected: 401 { message: "Invalid credentials" }
```

### Protected route without token
```
GET http://localhost:5001/api/admin/stats  (no Authorization header)

Expected: 401 { message: "No token provided" }
```
