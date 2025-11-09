const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthy_restaurant';

async function deleteAdmin() {
  await mongoose.connect(MONGO_URI);
  const result = await User.deleteOne({ email: 'admin@healthyrestaurent.com' });
  console.log('Delete result:', result);
  await mongoose.disconnect();
}

deleteAdmin().catch(err => {
  console.error('Error deleting admin user:', err);
  mongoose.disconnect();
});
