const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const promotionRoutes = require('./routes/promotions');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/adminRoutes');
const chefRoutes = require('./routes/chefRoutes');
const cloudinaryRoutes = require('./routes/cloudinary');
const newsletterRoutes = require('./routes/newsletter');
const adminEmailRoutes = require('./routes/adminEmailRoutes');
const contactRoutes = require('./routes/contact');
const stripeRoutes = require('./routes/stripe');

// Initialize newsletter scheduler
const newsletterScheduler = require('./services/newsletterScheduler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003' ,
    'https://restaurentapp-e58k.onrender.com',// Chef frontend
    'https://www.eatfreshly.in'
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Passport middleware
app.use(passport.initialize());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chef', chefRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/admin/email', adminEmailRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/stripe', stripeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Healthy Restaurant API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware

const path = require('path');

// Serve admin static files
app.use('/admin', express.static(path.join(__dirname, '../admin_frontend/build')));

// Serve React admin frontend for admin routes
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin_frontend/build/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});


// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  
  // Start newsletter scheduler
  if (process.env.NODE_ENV !== 'test') {
    newsletterScheduler.start();
    console.log('📧 Newsletter scheduler initialized');
  }
});

module.exports = app;
