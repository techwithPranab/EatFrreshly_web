const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const chefUsers = [
  {
    name: 'Sarah Johnson',
    email: 'chef.manager@healthyrestaurant.com',
    password: 'ChefManager123!',
    phone: '+1-555-0101',
    role: 'chef_manager',
    isActive: true
  },
  {
    name: 'Michael Chen',
    email: 'chef.michael@healthyrestaurant.com',
    password: 'Chef123!',
    phone: '+1-555-0102',
    role: 'chef',
    isActive: true
  },
  {
    name: 'Emily Rodriguez',
    email: 'chef.emily@healthyrestaurant.com',
    password: 'Chef123!',
    phone: '+1-555-0103',
    role: 'chef',
    isActive: true
  },
  {
    name: 'David Thompson',
    email: 'chef.david@healthyrestaurant.com',
    password: 'Chef123!',
    phone: '+1-555-0104',
    role: 'chef',
    isActive: true
  },
  {
    name: 'Lisa Park',
    email: 'chef.lisa@healthyrestaurant.com',
    password: 'Chef123!',
    phone: '+1-555-0105',
    role: 'chef',
    isActive: true
  }
];

async function seedChefUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');


    // Delete existing chef users (chef_manager and chef roles)
    const deleteResult = await User.deleteMany({ role: { $in: ['chef_manager', 'chef'] } });
    console.log(`Deleted ${deleteResult.deletedCount} existing chef users.`);

    // Create chef users with plain password (model will hash)
    const chefUserPromises = chefUsers.map(async (userData) => {
      const newUser = new User({
        name: userData.name,
        email: userData.email,
        passwordHash: userData.password, // Let model hash it
        phone: userData.phone,
        role: userData.role,
        isActive: userData.isActive
      });
      await newUser.save();
      console.log(`✅ Created ${userData.role}: ${userData.name} (${userData.email})`);
      return newUser;
    });
    await Promise.all(chefUserPromises);

    console.log('\n🎉 Chef users seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('==================');
    chefUsers.forEach(user => {
      console.log(`${user.role}: ${user.email} / ${user.password}`);
    });

  } catch (error) {
    console.error('❌ Error seeding chef users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  seedChefUsers();
}

module.exports = seedChefUsers;
