const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Promotion = require('../models/Promotion');

// Sample data
// Helper to generate random price between 100 and 300
// Helper to generate random discount percentage between 10 and 30
function getRandomDiscountPercent() {
  return Math.floor(Math.random() * (30 - 10 + 1)) + 10;
}
function getRandomINRPrice() {
  return Math.floor(Math.random() * (300 - 100 + 1)) + 100;
}

const sampleMenuItems = [
  // Indian Healthy Starters
  {
    name: "Sprouted Moong Salad",
    category: "Starters",
    description: "Protein-rich sprouted green gram tossed with tomatoes, onions, coriander, and lemon juice.",
    price: getRandomINRPrice(),
    currency: "INR",
    discountedPrice: null, // will be set below
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
    ingredients: ["sprouted moong", "tomato", "onion", "coriander", "lemon"],
    nutritionalInfo: {
      calories: 120,
      protein: 8,
      carbs: 18,
      fat: 1,
      fiber: 5
    },
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    preparationTime: 10
  },
  {
    name: "Dhokla",
    category: "Starters",
    description: "Steamed fermented chickpea flour cake, light and fluffy, garnished with mustard seeds and coriander.",
    price: getRandomINRPrice(),
    currency: "INR",
    discountedPrice: null,
    imageUrl: "https://images.unsplash.com/photo-1604908177522-432c9b6c7a7a?w=400",
    ingredients: ["besan", "yogurt", "mustard seeds", "coriander", "green chili"],
    nutritionalInfo: {
      calories: 150,
      protein: 6,
      carbs: 28,
      fat: 3,
      fiber: 2
    },
    isVegetarian: true,
    isGlutenFree: true,
    preparationTime: 20
  },
  {
    name: "Palak Chaat",
    category: "Starters",
    description: "Crispy spinach leaves topped with tangy yogurt, chutneys, and pomegranate seeds.",
    price: getRandomINRPrice(),
    currency: "INR",
    discountedPrice: null,
    imageUrl: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400",
    ingredients: ["spinach", "yogurt", "tamarind chutney", "mint chutney", "pomegranate"],
    nutritionalInfo: {
      calories: 180,
      protein: 5,
      carbs: 22,
      fat: 4,
      fiber: 3
    },
    isVegetarian: true,
    preparationTime: 15
  },

  // Indian Healthy Main Course
  {
    name: "Bajra Khichdi",
    category: "Main Course",
    description: "Wholesome millet and lentil porridge cooked with vegetables and mild spices.",
    price: getRandomINRPrice(),
    currency: "INR",
    discountedPrice: null,
    imageUrl: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400",
    ingredients: ["bajra", "moong dal", "carrot", "peas", "cumin"],
    nutritionalInfo: {
      calories: 250,
      protein: 10,
      carbs: 40,
      fat: 3,
      fiber: 7
    },
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    preparationTime: 25
  },
  {
    name: "Paneer Tikka Bowl",
    category: "Main Course",
    description: "Grilled paneer cubes served over brown rice with roasted veggies and mint chutney.",
    price: getRandomINRPrice(),
    currency: "INR",
    discountedPrice: null,
    imageUrl: "https://images.unsplash.com/photo-1604908177522-432c9b6c7a7a?w=400",
    ingredients: ["paneer", "brown rice", "bell peppers", "mint chutney", "yogurt"],
    nutritionalInfo: {
      calories: 380,
      protein: 18,
      carbs: 45,
      fat: 12,
      fiber: 6
    },
    isVegetarian: true,
    isGlutenFree: true,
    isSignature: true,
    preparationTime: 30
  },
  {
    name: "Rajma Brown Rice",
    category: "Main Course",
    description: "Protein-packed kidney beans curry served with fiber-rich brown rice.",
    price: getRandomINRPrice(),
    currency: "INR",
    discountedPrice: null,
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
    ingredients: ["rajma", "brown rice", "tomato", "onion", "spices"],
    nutritionalInfo: {
      calories: 420,
      protein: 14,
      carbs: 70,
      fat: 4,
      fiber: 10
    },
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isSignature: true,
    preparationTime: 35
  },

  // Indian Healthy Salads
  {
    name: "Koshimbir Salad",
    category: "Salads",
    description: "Maharashtrian salad of cucumber, carrot, coconut, and peanuts with lemon dressing.",
    price: getRandomINRPrice(),
    currency: "INR",
    discountedPrice: null,
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
    ingredients: ["cucumber", "carrot", "coconut", "peanuts", "lemon"],
    nutritionalInfo: {
      calories: 110,
      protein: 4,
      carbs: 12,
      fat: 5,
      fiber: 3
    },
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    preparationTime: 8
  },
  {
    name: "Chana Chaat",
    category: "Salads",
    description: "Tangy chickpea salad with onions, tomatoes, cucumber, and spices.",
    price: getRandomINRPrice(),
    currency: "INR",
    discountedPrice: null,
    imageUrl: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400",
    ingredients: ["chickpeas", "onion", "tomato", "cucumber", "chaat masala"],
    nutritionalInfo: {
      calories: 160,
      protein: 7,
      carbs: 28,
      fat: 2,
      fiber: 6
    },
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    preparationTime: 10
  },

  // Indian Healthy Drinks
  {
    name: "Masala Chaas",
    category: "Drinks",
    description: "Refreshing spiced buttermilk with roasted cumin and coriander.",
    price: getRandomINRPrice(),
    currency: "INR",
    discountedPrice: null,
    imageUrl: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400",
    ingredients: ["buttermilk", "cumin", "coriander", "mint", "salt"],
    nutritionalInfo: {
      calories: 60,
      protein: 3,
      carbs: 7,
      fat: 2,
      fiber: 0
    },
    isVegetarian: true,
    isGlutenFree: true,
    preparationTime: 5
  },
  {
    name: "Amla Ginger Juice",
    category: "Drinks",
    description: "Vitamin C-rich Indian gooseberry juice blended with ginger and honey.",
    price: getRandomINRPrice(),
    currency: "INR",
    discountedPrice: null,
    imageUrl: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400",
    ingredients: ["amla", "ginger", "honey", "lemon"],
    nutritionalInfo: {
      calories: 50,
      protein: 1,
      carbs: 12,
      fat: 0,
      fiber: 2
    },
    isVegetarian: true,
    isGlutenFree: true,
    preparationTime: 5
  },

  // Indian Healthy Desserts
  {
    name: "Fruit & Nut Lassi",
    category: "Desserts",
    description: "Low-fat yogurt blended with fresh fruits and nuts, lightly sweetened.",
    price: getRandomINRPrice(),
    currency: "INR",
    discountedPrice: null,
    imageUrl: "https://images.unsplash.com/photo-1511909525232-61113c912358?w=400",
    ingredients: ["low-fat yogurt", "banana", "apple", "almonds", "honey"],
    nutritionalInfo: {
      calories: 180,
      protein: 6,
      carbs: 28,
      fat: 4,
      fiber: 2
    },
    isVegetarian: true,
    isGlutenFree: true,
    isSignature: true,
    preparationTime: 8
  },
  {
    name: "Jowar Dates Laddu",
    category: "Desserts",
    description: "Sweet balls made from jowar flour, dates, and nuts, no added sugar.",
    price: getRandomINRPrice(),
    currency: "INR",
    discountedPrice: null,
    imageUrl: "https://images.unsplash.com/photo-1511909525232-61113c912358?w=400",
    ingredients: ["jowar flour", "dates", "cashews", "almonds", "cardamom"],
    nutritionalInfo: {
      calories: 140,
      protein: 3,
      carbs: 22,
      fat: 5,
      fiber: 3
    },
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    preparationTime: 15
  }
];

// Set static discountedPrice (20% off) for all menu items
sampleMenuItems.forEach(item => {
  item.discountedPrice = Math.round(item.price * 0.8);
});

const samplePromotions = [
  {
    title: "Welcome to Healthy Living",
    description: "Get 20% off your first order! Start your healthy journey with us.",
    discountPercent: 20,
    validFrom: new Date(),
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    promoCode: "WELCOME20",
    minimumOrderAmount: 15,
    maxDiscountAmount: 10,
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400"
  },
  {
    title: "Lunch Special",
    description: "15% off all orders placed between 11 AM - 3 PM",
    discountPercent: 15,
    validFrom: new Date(),
    validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    promoCode: "LUNCH15",
    minimumOrderAmount: 12,
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400"
  },
  {
    title: "Healthy Weekend",
    description: "Special weekend offer - 25% off on all salads and smoothies",
    discountPercent: 25,
    validFrom: new Date(),
    validTo: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    promoCode: "WEEKEND25",
    minimumOrderAmount: 10,
    maxDiscountAmount: 15,
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400"
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      MenuItem.deleteMany({}),
      Promotion.deleteMany({})
    ]);
    console.log('🧹 Cleared existing data');

    // Create admin user (password will be hashed by the pre-save middleware)
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@healthyrestaurant.com',
      passwordHash: 'admin123',
      phone: '+1-555-0100',
      address: {
        street: '123 Admin Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA'
      },
      role: 'admin'
    });

    await adminUser.save();
    console.log('👤 Created admin user');

    // Create sample customer (password will be hashed by the pre-save middleware)
    const customerUser = new User({
      name: 'John Doe',
      email: 'customer@example.com',
      passwordHash: 'customer123',
      phone: '+1-555-0200',
      address: {
        street: '456 Customer Avenue',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94103',
        country: 'USA'
      },
      role: 'customer'
    });

    await customerUser.save();
    console.log('👤 Created sample customer');

    // Create menu items
    await MenuItem.insertMany(sampleMenuItems);
    console.log(`🍽️  Created ${sampleMenuItems.length} menu items`);

    // Create promotions
    await Promotion.insertMany(samplePromotions);
    console.log(`🎉 Created ${samplePromotions.length} promotions`);

    console.log('\n🎯 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@healthyrestaurant.com / admin123');
    console.log('Customer: customer@example.com / customer123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
