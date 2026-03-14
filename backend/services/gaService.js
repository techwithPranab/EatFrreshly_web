const https = require('https');

/**
 * Send purchase event to Google Analytics 4 via Measurement Protocol
 * Requires the following environment variables to be set in backend:
 * - GA_MEASUREMENT_ID (GA4 Measurement ID, e.g., G-XXXXXXXXXX)
 * - GA_API_SECRET (Measurement Protocol API secret)
 */
async function sendPurchaseEvent(order) {
  const measurementId = process.env.GA_MEASUREMENT_ID;
  const apiSecret = process.env.GA_API_SECRET;

  if (!measurementId || !apiSecret) {
    console.warn('GA Measurement ID or API secret not configured; skipping server-side GA event.');
    return { success: false, skipped: true };
  }

  const endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;

  const items = (order.items || []).map((i) => ({
    item_id: i.menuItemId?.toString() || i._id?.toString() || String(i.menuItemId),
    item_name: i.name,
    price: i.price,
    quantity: i.quantity,
  }));

  const payload = {
    // Reasonable fallback: use user id as user_id so events can be attributed to the authenticated user
    user_id: order.userId?._id?.toString() || order.userId?.toString() || undefined,
    // client_id is required if user_id is not provided; use a stable fallback
    client_id: order.userId?._id ? `${order.userId._id}.server` : `server-${order._id}`,
    events: [
      {
        name: 'purchase',
        params: {
          transaction_id: order._id.toString(),
          value: order.totalPrice,
          currency: 'INR',
          tax: order.tax || 0,
          shipping: order.deliveryFee || 0,
          items,
        },
      },
    ],
  };

  const body = JSON.stringify(payload);
  const url = new URL(endpoint);

  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ GA Measurement Protocol event sent successfully for order', order._id.toString());
          resolve({ success: true, statusCode: res.statusCode });
        } else {
          console.error('❌ GA Measurement Protocol returned error', res.statusCode, data);
          resolve({ success: false, statusCode: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => {
      console.error('❌ Failed to send GA Measurement Protocol event', err);
      reject(err);
    });

    req.write(body);
    req.end();
  });
}

module.exports = { sendPurchaseEvent };
