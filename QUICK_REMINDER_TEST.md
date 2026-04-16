**QUICK START: TEST PAYMENT REMINDERS**

## 🚀 FASTEST WAY TO TEST (2 minutes)

### 1️⃣  Start Backend
```bash
npm start
```
Look for: `✅ Reminder scheduler started successfully`

### 2️⃣  Create Test Reminder

**Using cURL** (replace JWT_TOKEN with your token):
```bash
curl -X POST http://localhost:5000/api/notifications/test-reminder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{"type": "pre_payment"}'
```

**Using Postman/Thunder Client:**
```
POST http://localhost:5000/api/notifications/test-reminder

Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json

Body (raw JSON):
{
  "type": "pre_payment"
}
```

### 3️⃣  Check Response
- Status: **201 Created** ✅
- Message: "Test pre_payment reminder created successfully"

### 4️⃣  See Reminder in Frontend
- Go to your app's "System Reminders" section
- **Green badge shows new reminder!** 🎉

### 5️⃣  Test Overdue Reminder Too
```bash
curl -X POST http://localhost:5000/api/notifications/test-reminder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{"type": "overdue"}'
```

---

## 📋 VERIFY ALL REMINDERS

```bash
curl http://localhost:5000/api/notifications \
  -H "Authorization: Bearer JWT_TOKEN"
```

Look for notifications with:
- `"type": "payment_pre_payment"` ← Pre-payment reminder
- `"type": "payment_overdue_reminder"` ← Overdue reminder

---

## 🗑️ DELETE TEST DATA WHEN DONE

```bash
curl -X DELETE http://localhost:5000/api/notifications/NOTIFICATION_ID \
  -H "Authorization: Bearer JWT_TOKEN"
```

Replace `NOTIFICATION_ID` with ID from the GET response above.

---

## ⚙️ AUTOMATIC BEHAVIOR

**Right Now** (March 31, 2026):
- [✅] Test endpoint works instantly
- [⏳] April 24: Auto-create pre-payment reminder
- [⏳] April 29: Auto-create overdue reminder  
- [⏳] May 29: Reminders auto-expire after 30 days

**Server starts up:**
1. Loads all payment cycles
2. Creates TODAY's reminders (if applicable)
3. Runs check every 24 hours

---

## 📊 EXPECTED BEHAVIOR

**Pre-Payment Reminder** (5 days before start):
```
🔔 Payment Window Opening Soon
Your payment for cycle 1 will open on April 29, 2026...
```

**Overdue Reminder** (after start date):
```
⚠️ Payment Window Open - Action Required  
Your payment for cycle 1 is now open...
```

---

## 🐛 QUICK TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| 500 error on test-reminder | Ensure you have an active payment cycle |
| Reminder not appearing in UI | Refresh page / Check network tab |
| "Reminder already exists" | Delete old one first via API |
| Scheduler won't start | Check backend console for errors |

---

## 📍 KEY FILES CHANGED

- Backend service: `backend/src/payment/services/reminderService.js`
- Scheduler: `backend/src/utils/reminderScheduler.js`  
- Routes: `backend/src/routes/notificationRoutes.js`
- Model: `backend/src/models/Notification.js`
- Controller: `backend/src/controllers/notificationController.js`
- Server: `backend/src/server.js`

**Everything is automatic now! No more manual steps needed after April 24.** ✨
