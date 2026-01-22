const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Admin = require('../models/Admin');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const resetAdminPassword = async () => {
  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('ADMIN_EMAIL or ADMIN_PASSWORD is missing in backend/.env');
    process.exit(1);
  }

  await connectDB();

  let admin = await Admin.findOne({ email: adminEmail });
  if (!admin) {
    admin = await Admin.create({
      email: adminEmail,
      password: adminPassword,
      role: 'super_admin',
      isActive: true
    });
    console.log(`Admin created: ${admin.email}`);
  } else {
    admin.password = adminPassword;
    admin.isActive = true;
    await admin.save();
    console.log(`Admin password reset: ${admin.email}`);
  }

  await mongoose.connection.close();
};

resetAdminPassword().catch((error) => {
  console.error(error);
  process.exit(1);
});
