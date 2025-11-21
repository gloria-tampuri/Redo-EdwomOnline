#!/usr/bin/env node

/**
 * Seed Script: Create Initial Admin User
 * 
 * Usage:
 * npm run seed:admin
 * 
 * This script creates a super admin user that can later create other admins.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

async function seedAdmin() {
  try {
    // Get MongoDB URI from environment
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Define User Schema
    const userSchema = new mongoose.Schema({
      id: { type: String },
      email: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      passwordHash: { type: String, required: true },
      role: { type: String, enum: ['user', 'admin'], default: 'user' },
      isEmailVerified: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    });

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // Admin credentials
    const adminEmail = 'admin@edwom.com';
    const adminPassword = 'Admin@123456';
    const adminName = 'Super Admin';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:', adminEmail);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    // Create admin user
    console.log('👤 Creating super admin user...');
    const adminUser = new User({
      email: adminEmail,
      name: adminName,
      passwordHash,
      role: 'admin',
      isEmailVerified: true,
    });

    await adminUser.save();

    console.log('\n✅ Super Admin Created Successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:    ' + adminEmail);
    console.log('🔑 Password: ' + adminPassword);
    console.log('👤 Name:     ' + adminName);
    console.log('👑 Role:     admin');
    console.log('═══════════════════════════════════════\n');

    console.log('📝 Next Steps:');
    console.log('1. Start dev server: npm run dev');
    console.log('2. Go to http://localhost:3000/auth/admin-login');
    console.log('3. Enter the email and password above');
    console.log('4. You should see the admin dashboard');
    console.log('5. Use the admin panel to create other admins\n');

    console.log('⚠️  SECURITY NOTE:');
    console.log('⚠️  Change this admin password after first login!');
    console.log('⚠️  Do NOT use these credentials in production!\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

seedAdmin();
