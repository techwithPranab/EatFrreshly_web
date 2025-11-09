# Healthy Restaurant Backend API

A comprehensive Node.js + Express backend API for a healthy restaurant management system with JWT authentication, MongoDB integration, and full CRUD operations.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Menu Management**: Full CRUD operations for menu items with categories and filters
- **Cart System**: Add, update, remove items with quantity management
- **Order Management**: Place orders, track status, order history
- **Promotions**: Promo codes with validation and usage tracking
- **User Profiles**: Update profile information, change passwords
- **Admin Dashboard**: Manage menu items, orders, and promotions
- **Data Validation**: Comprehensive input validation using express-validator
- **Security**: Password hashing with bcrypt, CORS, helmet for security headers

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors
- **Environment**: dotenv
- **Development**: nodemon

## 📁 Project Structure

```
backend/
├── models/          # Mongoose schemas
│   ├── User.js      # User model with authentication
│   ├── MenuItem.js  # Menu items with categories
│   ├── Order.js     # Orders with status tracking
│   ├── Cart.js      # Shopping cart functionality
│   └── Promotion.js # Promotional offers
├── routes/          # API endpoints
│   ├── auth.js      # Authentication routes
│   ├── menu.js      # Menu management
│   ├── cart.js      # Cart operations
│   ├── orders.js    # Order management
│   ├── promotions.js# Promotion management
│   └── users.js     # User profile management
├── middleware/      # Custom middleware
│   └── auth.js      # JWT authentication middleware
├── scripts/         # Utility scripts
│   └── seedData.js  # Database seeding script
├── .env             # Environment variables
├── package.json     # Dependencies and scripts
└── server.js        # Main application entry point
```

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/healthy_restaurant
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # For macOS with Homebrew
   brew services start mongodb-community
   
   # For Ubuntu/Linux
   sudo systemctl start mongod
   
   # For Windows
   net start MongoDB
   ```

5. **Seed the database** (Optional but recommended)
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1-555-0123",
  "address": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "country": "USA"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Verify Token
```http
POST /api/auth/verify-token
Content-Type: application/json

{
  "token": "your_jwt_token_here"
}
```

### Menu Endpoints

#### Get All Menu Items
```http
GET /api/menu?category=Starters&search=salad&page=1&limit=20
```

#### Get Menu Item by ID
```http
GET /api/menu/:id
```

#### Create Menu Item (Admin only)
```http
POST /api/menu
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Healthy Salad",
  "category": "Salads",
  "description": "Fresh mixed greens with organic vegetables",
  "price": 12.99,
  "imageUrl": "https://example.com/image.jpg",
  "ingredients": ["lettuce", "tomatoes", "cucumbers"],
  "nutritionalInfo": {
    "calories": 250,
    "protein": 8,
    "carbs": 20,
    "fat": 10,
    "fiber": 6
  },
  "isVegetarian": true,
  "isVegan": true,
  "isGlutenFree": true,
  "preparationTime": 15
}
```

### Cart Endpoints

#### Get User Cart
```http
GET /api/cart
Authorization: Bearer <token>
```

#### Add Item to Cart
```http
POST /api/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "menuItemId": "64f7b8c9d1234567890abcde",
  "quantity": 2
}
```

#### Update Cart Item
```http
PUT /api/cart/update/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove Item from Cart
```http
DELETE /api/cart/remove/:itemId
Authorization: Bearer <token>
```

### Order Endpoints

#### Place Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "country": "USA"
  },
  "paymentMethod": "Credit Card",
  "specialInstructions": "Please ring the doorbell"
}
```

#### Get User Orders
```http
GET /api/orders?page=1&limit=10&status=Delivered
Authorization: Bearer <token>
```

#### Track Order
```http
GET /api/orders/track/:orderNumber
Authorization: Bearer <token>
```

### User Profile Endpoints

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "+1-555-0124",
  "address": {
    "street": "456 New Street",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94103",
    "country": "USA"
  }
}
```

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,           // User's full name
  email: String,          // Unique email address
  passwordHash: String,   // Hashed password
  phone: String,          // Phone number
  address: Object,        // Full address object
  role: String,           // 'customer' or 'admin'
  isActive: Boolean,      // Account status
  createdAt: Date,        // Account creation date
  updatedAt: Date         // Last update date
}
```

### MenuItem Model
```javascript
{
  name: String,           // Menu item name
  category: String,       // Category (enum)
  description: String,    // Item description
  price: Number,          // Price in USD
  imageUrl: String,       // Image URL
  ingredients: [String],  // List of ingredients
  nutritionalInfo: Object,// Calories, protein, etc.
  isVegetarian: Boolean,  // Vegetarian flag
  isVegan: Boolean,       // Vegan flag
  isGlutenFree: Boolean,  // Gluten-free flag
  isAvailable: Boolean,   // Availability status
  preparationTime: Number,// Prep time in minutes
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  userId: ObjectId,       // Reference to User
  items: [Object],        // Array of order items
  totalPrice: Number,     // Total order amount
  status: String,         // Order status (enum)
  deliveryAddress: Object,// Delivery address
  paymentMethod: String,  // Payment method
  orderNumber: String,    // Unique order number
  estimatedDeliveryTime: Date,
  specialInstructions: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Authentication & Security

- **JWT Authentication**: Stateless authentication using JSON Web Tokens
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **Role-based Access**: Customer and Admin roles with different permissions
- **Input Validation**: Comprehensive validation using express-validator
- **Security Headers**: Helmet.js for setting security headers
- **CORS**: Configured for cross-origin requests

## 🧪 Testing

### Sample Login Credentials

After running the seed script, you can use these credentials:

**Admin Account:**
- Email: `admin@healthyrestaurant.com`
- Password: `admin123`

**Customer Account:**
- Email: `customer@example.com`
- Password: `customer123`

### API Testing Tools

- **Postman**: Import the API endpoints for easy testing
- **curl**: Use command line for quick API calls
- **Thunder Client**: VS Code extension for API testing

### Example API Test
```bash
# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"customer123"}'

# Test protected endpoint
curl -X GET http://localhost:5000/api/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚀 Deployment

### Environment Variables for Production
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthy_restaurant
JWT_SECRET=your_production_jwt_secret_key_very_long_and_secure
JWT_EXPIRE=7d
NODE_ENV=production
```

### Deployment Platforms
- **Heroku**: Easy deployment with MongoDB Atlas
- **Vercel**: Serverless deployment
- **DigitalOcean**: VPS deployment
- **AWS EC2**: Full control deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you have any questions or run into issues:

1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Provide error logs and environment details

## 🔄 API Response Format

All API responses follow this consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors array (if applicable)
  ]
}
```

This ensures consistent and predictable API responses across all endpoints.
