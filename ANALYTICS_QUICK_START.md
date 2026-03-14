# Google Analytics Integration - Quick Reference

## 🔑 What You Need

1. **Google Analytics 4 Measurement ID**
   - Format: `G-XXXXXXXXXX`
   - Get it from: https://analytics.google.com

2. **Google Tag Manager Container ID**
   - Format: `GTM-XXXXXXX`
   - Get it from: https://tagmanager.google.com

## ⚡ Quick Setup (5 Minutes)

### 1. Get Your IDs
- Create GA4 property → Copy Measurement ID
- Create GTM container → Copy Container ID

### 2. Configure Environment
```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local and add your IDs
```

### 3. Test
```bash
npm run dev
# Open http://localhost:3000
# Check browser console for 📊 messages
```

### 4. Verify
- Open GA4 → Reports → Realtime
- You should see yourself as an active user!

## 📊 Events Tracked

### Homepage
- Page view
- Featured items view
- Newsletter signup

### Menu Page
- Menu items view
- Add to cart
- Item selection

### Cart Page
- Cart view
- Remove from cart
- Begin checkout

### Checkout Page (To be added)
- Payment info
- Purchase complete

## 🎯 Important Conversions

Mark these as conversions in GA4:
- `purchase` - Revenue tracking
- `begin_checkout` - Funnel analysis
- `sign_up` - Lead generation
- `add_to_cart` - Engagement

## 🔍 Testing

```javascript
// Open browser console and run:
window.gtag('event', 'test_event', { test: true });

// Should see in GA4 Realtime within 30 seconds
```

## 📝 Files Created

```
frontend/
├── .env.local.example         # Environment template
├── src/
│   ├── components/
│   │   └── analytics/
│   │       └── GoogleAnalytics.tsx  # GA4 & GTM components
│   └── utils/
│       └── analytics.ts       # Event tracking functions
```

## 🚨 Common Issues

**Events not showing?**
- Check .env.local has correct IDs
- Disable ad blockers
- Wait 30-60 seconds
- Check GA4 Realtime (not Overview)

**TypeScript errors?**
```bash
rm -rf .next && npm run dev
```

**GTM not loading?**
- Verify GTM_ID in .env.local
- Check page source for GTM scripts
- Use GTM Preview Mode

## 🎓 Learn More

- See `PHASE_1_SETUP_GUIDE.md` for detailed instructions
- See `GOOGLE_ANALYTICS_SEO_AI_INTEGRATION_PLAN.md` for full plan

## ✅ Checklist

- [ ] Created GA4 property
- [ ] Created GTM container
- [ ] Added IDs to .env.local
- [ ] Tested in browser
- [ ] Verified in GA4 Realtime
- [ ] Marked conversions in GA4
- [ ] Enabled enhanced measurement

**Total Setup Time:** ~30 minutes
