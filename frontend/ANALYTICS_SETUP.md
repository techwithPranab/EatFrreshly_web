# Analytics Setup Guide

This document explains how to configure and test Google Analytics (GA4) and Google Tag Manager (GTM) for the EatFreshly frontend.

## 1. Add environment variables
Create or update `.env.local` in the `frontend/` folder with the following values:

```bash
# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Tag Manager (optional but recommended)
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Replace the placeholder IDs with values from your GA4 and GTM accounts.

+## Server-side (Backend) Measurement Protocol
+
+To reliably track conversions (e.g., purchases) server-side (so events are recorded even when client-side events fail), the backend sends events to GA4 using the Measurement Protocol.
+
+1. In Google Analytics (Admin → Data Streams → choose your web stream → Measurement Protocol API secrets), create a new API secret.
+2. In the backend `.env` (or your deployment environment), set:
+
+```bash
+# Google Analytics Measurement Protocol (server)
+GA_MEASUREMENT_ID=G-XXXXXXXXXX
+GA_API_SECRET=your_measurement_protocol_api_secret
+```
+
+3. The backend sends `purchase` events automatically when an order is created (both normal checkout and Stripe flows). Events include transaction id, value, currency, tax, shipping, and items.
+
+4. Testing:
+   - Use `curl` or Postman to create a test order (or place an order through the UI).
+   - Check backend logs for: `✅ GA Measurement Protocol event sent successfully for order <orderId>`
+   - Check GA4 DebugView (use the API secret's DebugView or Realtime) to confirm the `purchase` event.
+
+If you want, I can add a small admin endpoint to trigger a test purchase event for a given order id to help verify the Measurement Protocol integration.
+
## 2. What we added in code
- `src/components/analytics/GoogleAnalytics.tsx` — Loads GA4 & GTM scripts and sends page_view events automatically.
- `src/utils/analytics.ts` — Helper utilities (`trackEvent`, `analytics`, `userEngagement`, `businessEvents`, `pageTracking`) for firing events.
- Tracking hooks added to pages/components:
  - Home page: `pageTracking.homePage()` and newsletter signup event
  - Menu page: `analytics.viewItemList()` and `analytics.addToCart()`
  - Cart page: `analytics.viewCart()`, `analytics.removeFromCart()`, `analytics.beginCheckout()`
  - Checkout page: `analytics.viewCart()` (on load) and `analytics.purchase()` (on successful order)
  - Promotions page: `pageTracking.promotionsPage()` and `analytics.selectPromotion()`/`businessEvents.applyPromoCode()` when a promo is copied/applied

## 3. Testing locally
1. Start backend: `npm run dev` in `backend/` (ensure API runs on `http://localhost:5000` or set `NEXT_PUBLIC_API_URL`).
2. Start frontend: `npm run dev` in `frontend/` (default port `3000`).
3. Open the site in a browser, open DevTools → Console. You should see console logs like `📊 GA4 Page View: /` and `📊 Event tracked: add_to_cart` when interacting.
4. If you have GTM preview mode enabled, you can validate tags in the GTM interface.

## 4. Verifying events in GA4
- Use the GA4 DebugView (Realtime -> DebugView) to see events when you have `gtag` script loaded on the page and `window.gtag` is available.
- Events are logged by name (e.g., `add_to_cart`, `purchase`, `sign_up`).

## 5. Troubleshooting
- If you don't see page views or events:
  - Ensure `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set and the app is restarted.
  - Check the browser console for warnings from `GoogleAnalytics.tsx` about missing IDs.
  - Verify the GTM container and tags if using GTM.

## 6. Next Steps
- Add server-side Measurement Protocol events for important backend-only events (e.g., refunds).
- Configure conversions and audiences in the GA4 UI.
- Validate structured data and enriched events in Google Search Console.

If you want, I can now:
- Add server-side purchase events via Measurement Protocol (already implemented on order creation and Stripe confirm flows)
- Add GTM triggers and tags for more advanced tracking
- Configure recommended GA4 conversions in code for easier management

Which would you like me to do next?
