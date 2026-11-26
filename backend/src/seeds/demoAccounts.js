/**
 * Creates demo/test accounts when DEMO_PASSWORD is set (Render generates it —
 * see render.yaml). Read the password in Render → boardingbook-api → Environment.
 * Accounts are only created if missing; existing accounts are never modified.
 * Remove DEMO_PASSWORD (and delete the accounts) when you no longer need them.
 */
const User = require('../models/User');

const DEMO_ACCOUNTS = [
  {
    email: 'demo.student@my.sliit.lk',
    role: 'student',
    fullName: 'Demo Student',
    firstName: 'Demo',
    lastName: 'Student',
  },
  {
    email: 'demo.owner@boardingbook.app',
    role: 'owner',
    fullName: 'Demo Owner',
    phoneNumber: '0770000000',
    kycStatus: 'approved',
  },
];

async function ensureDemoAccounts() {
  const password = process.env.DEMO_PASSWORD;
  if (!password) return;
  if (password.length < 12) {
    console.warn('[demo] DEMO_PASSWORD is shorter than 12 characters — demo accounts not created');
    return;
  }
  for (const account of DEMO_ACCOUNTS) {
    try {
      const exists = await User.exists({ email: account.email });
      if (exists) continue;
      await User.create({ ...account, password, isVerified: true });
      console.log(`[demo] Created demo ${account.role} account: ${account.email}`);
    } catch (err) {
      console.warn(`[demo] Could not create ${account.email}: ${err.message}`);
    }
  }
}

module.exports = { ensureDemoAccounts, DEMO_ACCOUNTS };
