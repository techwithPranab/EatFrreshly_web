# Google Tag Manager (GTM) Setup Guide

This guide lists recommended tags/triggers/variables for GTM to capture EatFreshly events and send them to GA4.

## 1. Container & Setup
1. Create GTM account and container at https://tagmanager.google.com
2. Add the container ID (GTM-XXXXXX) to `frontend/.env.local` as `NEXT_PUBLIC_GTM_ID`.
3. Enable preview mode to test tags locally.

## 2. Recommended Tags
### A. GA4 Configuration Tag
- Tag Type: Google Analytics: GA4 Configuration
- Measurement ID: `G-...` (enter your GA4 Property ID)
- Trigger: All Pages
- Advanced: Set ‘Send a page view event when this configuration loads’ to false if you want to control page_view manually.

### B. GA4 Event Tags (optional — you can rely on gtag events)
- Tag Type: Google Analytics: GA4 Event
- Event Name: match the dataLayer/event name (e.g., `add_to_cart`, `purchase`, `sign_up`)
- Event Parameters: Map incoming dataLayer params to GA parameters (e.g., value, currency, items)
- Trigger: Custom Event — set event name to the same name

### C. Conversion Tracking (Ads)
- Create conversion tags and link them to GA4 / Google Ads as required.

## 3. Recommended Triggers
- Custom Event Trigger: `add_to_cart`
- Custom Event Trigger: `begin_checkout`
- Custom Event Trigger: `purchase`
- Custom Event Trigger: `sign_up`
- Page View Trigger: All Pages (for GA4 Configuration)

## 4. Data Layer
Our `trackEvent` utility pushes both `gtag('event', ...)` and `window.dataLayer.push({ event: '...', ...params })`, so GTM will see events named the same as GA event names.

Example dataLayer push:
```
window.dataLayer.push({
  event: 'purchase',
  transaction_id: 'ORDER123',
  value: 499.0,
  currency: 'INR',
  items: [{ item_id: 'abc', item_name: 'Quinoa Bowl', price: 499, quantity: 1 }]
});
```

## 5. Debugging & Testing
1. Open GTM Preview Mode and start a session on your site.
2. Perform actions (add to cart, checkout, purchase) and verify the event shows up in the GTM Preview -> Events log.
3. Verify that GA4 DebugView receives the corresponding event.

## 6. Tips
- Prefer `dataLayer` triggers for more flexible configuration and for non-GA destinations.
- Keep event names consistent between frontend and GTM.
- Use GTM to handle future marketing pixels/tags without code changes.

If you'd like, I can:
- Create an exported GTM container JSON with recommended tags/triggers (you’ll still need to import to your GTM account), or
- Add server-side GTM tagging via the Measurement Protocol for additional redundancy.
