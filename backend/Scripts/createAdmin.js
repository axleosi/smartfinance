import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../models/User.js';  // Adjust the path to your User model

dotenv.config();

const MONGO_URI = process.env.MONGO_URI

async function createAdmin() {
  try {
    await mongoose.connect(`${MONGO_URI}/smartfinance`);

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return process.exit(0);
    }

    const email = 'admin@example.com';
    const password = 'securePassword123';  // Change this to a strong password

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = new User({
      name: 'Administrator',
      email,
      password: hashedPassword,
      role: 'admin',
    });

    await adminUser.save();

    console.log('Admin user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);

    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
}

createAdmin();
