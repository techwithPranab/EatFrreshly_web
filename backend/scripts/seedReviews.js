// Sample script to seed review data - run this in backend to test reviews
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Order = require('../models/Order');
const User = require('../models/User');
require('dotenv').config();

const sampleReviews = [
  {
    rating: 5,
    comment: "Absolutely amazing! The quinoa bowl was fresh, delicious, and perfectly portioned. The delivery was quick and everything arrived hot. Definitely ordering again!",
    isAnonymous: false,
    isHighlighted: true
  },
  {
    rating: 5,
    comment: "Best healthy food delivery in the city! The ingredients are so fresh and the flavors are incredible. My go-to spot for nutritious meals.",
    isAnonymous: false,
    isHighlighted: true
  },
  {
    rating: 4,
    comment: "Great quality food and excellent service. The Mediterranean salad was fantastic. Only wish there were more dressing options.",
    isAnonymous: true,
    isHighlighted: true
  },
  {
    rating: 5,
    comment: "I've been ordering regularly for months now and they never disappoint. The variety is great and everything tastes amazing. Highly recommend!",
    isAnonymous: false,
    isHighlighted: true
  },
  {
    rating: 4,
    comment: "Love the concept and the food is really good. The protein bowls are my favorite. Fast delivery and great customer service too.",
    isAnonymous: false,
    isHighlighted: true
  }
];

const seedReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get sample users and orders
    const users = await User.find({ role: 'customer' }).limit(5);
    const orders = await Order.find({ status: 'Delivered' }).populate('userId').limit(5);

    if (users.length === 0 || orders.length === 0) {
      console.log('Need users and delivered orders to seed reviews');
      return;
    }

    // Clear existing reviews
    await Review.deleteMany({});
    console.log('Cleared existing reviews');

    // Create sample reviews
    const reviews = [];
    for (let i = 0; i < sampleReviews.length && i < orders.length; i++) {
      const reviewData = {
        userId: orders[i].userId._id,
        orderId: orders[i]._id,
        ...sampleReviews[i]
      };
      reviews.push(reviewData);
    }

    await Review.insertMany(reviews);
    console.log(`Created ${reviews.length} sample reviews`);

    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding reviews:', error);
    mongoose.disconnect();
  }
};

// Run if this file is executed directly
if (require.main === module) {
  seedReviews();
}

module.exports = seedReviews;
