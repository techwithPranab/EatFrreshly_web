# Healthy Restaurant - Next.js Frontend

This is the Next.js version of the Healthy Restaurant frontend, migrated from the original Vite + React application.

## Features

- ✅ **Next.js 15** with App Router
- ✅ **TypeScript** for better type safety
- ✅ **Tailwind CSS** for styling
- ✅ **Authentication Context** migrated from React
- ✅ **All API services** migrated and typed
- ✅ **Responsive Design** preserved from original
- ✅ **Component Architecture** maintained
- ✅ **Framer Motion** for animations
- ✅ **React Hook Form** for form handling
- ✅ **React Hot Toast** for notifications

## Migration Status

### ✅ Completed
- [x] Project setup with Next.js 15
- [x] Tailwind CSS configuration
- [x] TypeScript setup
- [x] Component migration (Layout, Common components)
- [x] Context and Services migration
- [x] Home page implementation
- [x] Basic routing structure
- [x] Authentication system
- [x] Global styles and animations

### 🚧 In Progress / To be completed
- [ ] All page components (Menu, Cart, Checkout, Profile, Orders, etc.)
- [ ] Form implementations with validation
- [ ] Protected routes middleware
- [ ] Order tracking functionality
- [ ] Payment integration
- [ ] Image optimization
- [ ] SEO optimization
- [ ] Performance optimization

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:5000`

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

3. Update environment variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with AuthProvider
│   ├── page.tsx           # Home page
│   ├── menu/              # Menu pages
│   ├── login/             # Authentication pages
│   └── ...                # Other page directories
├── components/            # Reusable components
│   ├── layout/           # Layout components (Navbar, Footer)
│   ├── common/           # Common UI components
│   └── ...               # Feature-specific components
├── context/              # React Context providers
├── services/             # API services and utilities
└── utils/                # Utility functions
```

## Key Changes from Original

1. **Routing**: Migrated from React Router to Next.js App Router
2. **Imports**: Updated all relative imports to use `@/` alias
3. **Links**: Changed `<Link to="">` to `<Link href="">`
4. **Navigation**: Replaced `useNavigate()` with `useRouter()` from Next.js
5. **Environment Variables**: Using `NEXT_PUBLIC_` prefix for client-side variables
6. **TypeScript**: Added proper type definitions throughout
7. **Client Components**: Added `'use client'` directive for interactive components

## API Integration

The application connects to the existing backend API. Make sure the backend server is running on `http://localhost:5000` before starting the frontend.

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

### Other Platforms
```bash
npm run build
npm start
```

## Backend Compatibility

This frontend is fully compatible with the existing backend API. No changes are required on the backend side.

## Contributing

1. Keep the existing component structure and styling
2. Maintain TypeScript types for all new components
3. Use Next.js best practices for performance
4. Follow the existing naming conventions
5. Test with the backend API before submitting changes

## Performance Considerations

- Images should be optimized using Next.js `Image` component
- Large pages should implement proper loading states
- Consider implementing lazy loading for heavy components
- Use Next.js built-in optimizations (bundling, tree-shaking, etc.)
