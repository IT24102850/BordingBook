/**
 * Run once to create the initial super admin account.
 * Usage: node src/admin/seed.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@boardingbook.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function seed() {
  if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
    console.error('Set ADMIN_PASSWORD (at least 12 characters) before running this script.');
    process.exit(1);
  }
  await mongoose.connect(require('../config/env').mongoUri);
  console.log('MongoDB connected');

  const existing = await Admin.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log('Admin already exists — skipping.');
    process.exit(0);
  }

  await Admin.create({
    name: 'Super Admin',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  console.log('Admin account created:');
  console.log(`  Email: ${ADMIN_EMAIL}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
