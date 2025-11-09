const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthy_restaurant';
console.log('MongoDB URI:', process.env.MONGODB_URI);
async function seedAdmin() {
  await mongoose.connect(MONGO_URI);

  const adminExists = await User.findOne({ role: 'admin' });
  console.log('Admin user check:', adminExists);
  if (adminExists) {
    console.log('Admin user already exists:', adminExists.email);
    await mongoose.disconnect();
    return;
  }

  const adminUser = new User({
    name: 'Admin User',
    email: 'admin@healthyrestaurent.com',
    passwordHash: 'admin123', // plain text, will be hashed by pre-save hook
    phone: '+10000000000',
    address: {
      street: '123 Main St',
      city: 'Metropolis',
      state: 'CA',
      zipCode: '90001',
      country: 'USA'
    },
    role: 'admin',
    isActive: true
  });

  await adminUser.save();
  console.log('Admin user seeded:', adminUser.email);
  await mongoose.disconnect();
}

seedAdmin().catch(err => {
  console.error('Error seeding admin user:', err);
  mongoose.disconnect();
});
