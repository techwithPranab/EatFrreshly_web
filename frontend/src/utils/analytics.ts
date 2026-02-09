/**
 * Google Analytics Event Tracking Utilities
 * 
 * This module provides helper functions to track various events
 * in Google Analytics 4 (GA4) for the EatFreshly application.
 */

// Type definitions for better TypeScript support
interface MenuItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  totalPrice: number;
  items: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  tax?: number;
  deliveryFee?: number;
}

interface Promotion {
  _id: string;
  title: string;
  promoCode: string;
  discountPercent: number;
}

/**
 * Core event tracking function
 */
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    // Push to dataLayer for GTM compatibility
    try {
      if (window.dataLayer && typeof window.dataLayer.push === 'function') {
        window.dataLayer.push({ event: eventName, ...parameters });
      }
    } catch (err) {
      console.warn('Failed to push to dataLayer', err);
    }

    if (window.gtag) {
      window.gtag('event', eventName, parameters);
      console.log(`📊 Event tracked: ${eventName}`, parameters);
    } else {
      console.warn('⚠️ Google Analytics is not initialized');
    }
  } else {
    console.warn('⚠️ Google Analytics is not initialized');
  }
};

/**
 * E-commerce Analytics Events
 */
export const analytics = {
  /**
   * Track when a user views a menu item
   */
  viewItem: (item: MenuItem) => {
    trackEvent('view_item', {
      currency: 'INR',
      value: item.price,
      items: [{
        item_id: item._id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
      }],
    });
  },

  /**
   * Track when a user views a list of items (e.g., menu page, category)
   */
  viewItemList: (items: MenuItem[], listName: string = 'Menu') => {
    trackEvent('view_item_list', {
      item_list_name: listName,
      items: items.slice(0, 10).map((item, index) => ({
        item_id: item._id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        index: index,
      })),
    });
  },

  /**
   * Track when a user selects an item from a list
   */
  selectItem: (item: MenuItem, listName: string = 'Menu') => {
    trackEvent('select_item', {
      item_list_name: listName,
      items: [{
        item_id: item._id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
      }],
    });
  },

  /**
   * Track when a user adds an item to cart
   */
  addToCart: (item: MenuItem, quantity: number = 1) => {
    trackEvent('add_to_cart', {
      currency: 'INR',
      value: item.price * quantity,
      items: [{
        item_id: item._id,
        item_name: item.name,
        item_category: item.category,
        quantity: quantity,
        price: item.price,
      }],
    });
  },

  /**
   * Track when a user removes an item from cart
   */
  removeFromCart: (item: MenuItem, quantity: number = 1) => {
    trackEvent('remove_from_cart', {
      currency: 'INR',
      value: item.price * quantity,
      items: [{
        item_id: item._id,
        item_name: item.name,
        item_category: item.category,
        quantity: quantity,
        price: item.price,
      }],
    });
  },

  /**
   * Track when a user views their cart
   */
  viewCart: (cart: { items: CartItem[]; total: number }) => {
    trackEvent('view_cart', {
      currency: 'INR',
      value: cart.total,
      items: cart.items.map((item) => ({
        item_id: item.menuItem._id,
        item_name: item.menuItem.name,
        item_category: item.menuItem.category,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  },

  /**
   * Track when a user begins checkout
   */
  beginCheckout: (cart: { items: CartItem[]; total: number }) => {
    trackEvent('begin_checkout', {
      currency: 'INR',
      value: cart.total,
      items: cart.items.map((item) => ({
        item_id: item.menuItem._id,
        item_name: item.menuItem.name,
        item_category: item.menuItem.category,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  },

  /**
   * Track checkout progress steps
   */
  checkoutProgress: (step: number, stepName: string, value: number) => {
    trackEvent('checkout_progress', {
      checkout_step: step,
      checkout_option: stepName,
      currency: 'INR',
      value: value,
    });
  },

  /**
   * Track when a user adds payment info
   */
  addPaymentInfo: (paymentMethod: string, value: number) => {
    trackEvent('add_payment_info', {
      currency: 'INR',
      value: value,
      payment_type: paymentMethod,
    });
  },

  /**
   * Track when a user adds shipping info
   */
  addShippingInfo: (shippingTier: string, value: number) => {
    trackEvent('add_shipping_info', {
      currency: 'INR',
      value: value,
      shipping_tier: shippingTier,
    });
  },

  /**
   * Track successful purchase (MOST IMPORTANT CONVERSION)
   */
  purchase: (order: Order) => {
    trackEvent('purchase', {
      transaction_id: order._id,
      value: order.totalPrice,
      currency: 'INR',
      tax: order.tax || 0,
      shipping: order.deliveryFee || 0,
      items: order.items.map((item) => ({
        item_id: item.menuItemId,
        item_name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  },

  /**
   * Track refund
   */
  refund: (transactionId: string, value: number) => {
    trackEvent('refund', {
      transaction_id: transactionId,
      value: value,
      currency: 'INR',
    });
  },

  /**
   * Track when a user views a promotion
   */
  viewPromotion: (promotion: Promotion) => {
    trackEvent('view_promotion', {
      promotion_id: promotion._id,
      promotion_name: promotion.title,
      creative_name: promotion.promoCode,
      discount: promotion.discountPercent,
    });
  },

  /**
   * Track when a user selects/applies a promotion
   */
  selectPromotion: (promotion: Promotion) => {
    trackEvent('select_promotion', {
      promotion_id: promotion._id,
      promotion_name: promotion.title,
      creative_name: promotion.promoCode,
      discount: promotion.discountPercent,
    });
  },

  /**
   * Track search queries
   */
  search: (searchTerm: string, resultsCount?: number) => {
    trackEvent('search', {
      search_term: searchTerm,
      ...(resultsCount !== undefined && { results_count: resultsCount }),
    });
  },
};

/**
 * User Engagement Events
 */
export const userEngagement = {
  /**
   * Track newsletter signup
   */
  newsletterSignup: (email: string) => {
    trackEvent('sign_up', {
      method: 'newsletter',
    });
    
    // Track as conversion
    trackEvent('generate_lead', {
      value: 1,
      currency: 'INR',
    });
  },

  /**
   * Track user registration
   */
  register: (method: string = 'email') => {
    trackEvent('sign_up', {
      method: method,
    });
  },

  /**
   * Track user login
   */
  login: (method: string = 'email') => {
    trackEvent('login', {
      method: method,
    });
  },

  /**
   * Track review submission
   */
  submitReview: (rating: number, menuItemId: string, menuItemName: string) => {
    trackEvent('submit_review', {
      rating: rating,
      item_id: menuItemId,
      item_name: menuItemName,
    });
    
    // Track as engagement
    trackEvent('engagement', {
      engagement_type: 'review',
      value: rating,
    });
  },

  /**
   * Track contact form submission
   */
  contactFormSubmit: (topic: string) => {
    trackEvent('contact_form_submit', {
      topic: topic,
    });
    
    // Track as lead generation
    trackEvent('generate_lead', {
      value: 1,
      currency: 'INR',
      lead_source: 'contact_form',
    });
  },

  /**
   * Track social share
   */
  share: (method: string, contentType: string, itemId?: string) => {
    trackEvent('share', {
      method: method,
      content_type: contentType,
      ...(itemId && { item_id: itemId }),
    });
  },

  /**
   * Track when user views contact info
   */
  viewContactInfo: () => {
    trackEvent('view_contact_info', {});
  },

  /**
   * Track phone call clicks
   */
  clickToCall: (phoneNumber: string) => {
    trackEvent('click_to_call', {
      phone_number: phoneNumber,
    });
  },

  /**
   * Track email clicks
   */
  clickToEmail: (email: string) => {
    trackEvent('click_to_email', {
      email: email,
    });
  },

  /**
   * Track file downloads (e.g., menu PDF)
   */
  download: (fileName: string, fileType: string) => {
    trackEvent('file_download', {
      file_name: fileName,
      file_type: fileType,
    });
  },

  /**
   * Track video plays (if you add videos)
   */
  videoPlay: (videoTitle: string, videoUrl: string) => {
    trackEvent('video_play', {
      video_title: videoTitle,
      video_url: videoUrl,
    });
  },

  /**
   * Track scroll depth (trigger at 25%, 50%, 75%, 100%)
   */
  scrollDepth: (percentage: number, pagePath: string) => {
    trackEvent('scroll_depth', {
      percent_scrolled: percentage,
      page_path: pagePath,
    });
  },

  /**
   * Track time on page
   */
  timeOnPage: (seconds: number, pagePath: string) => {
    trackEvent('time_on_page', {
      time_seconds: seconds,
      page_path: pagePath,
    });
  },
};

/**
 * Custom Business Events
 */
export const businessEvents = {
  /**
   * Track when user applies a promo code
   */
  applyPromoCode: (promoCode: string, success: boolean, discount?: number) => {
    trackEvent('apply_promo_code', {
      promo_code: promoCode,
      success: success,
      ...(discount && { discount_amount: discount }),
    });
  },

  /**
   * Track order tracking views
   */
  trackOrder: (orderId: string, orderStatus: string) => {
    trackEvent('track_order', {
      order_id: orderId,
      order_status: orderStatus,
    });
  },

  /**
   * Track delivery address addition
   */
  addDeliveryAddress: () => {
    trackEvent('add_delivery_address', {});
  },

  /**
   * Track preferred delivery time selection
   */
  selectDeliveryTime: (deliveryTime: string) => {
    trackEvent('select_delivery_time', {
      delivery_time: deliveryTime,
    });
  },

  /**
   * Track cart abandonment (trigger after 5 mins of inactivity)
   */
  cartAbandonment: (cartValue: number, itemCount: number) => {
    trackEvent('cart_abandonment', {
      currency: 'INR',
      value: cartValue,
      item_count: itemCount,
    });
  },

  /**
   * Track errors (for debugging)
   */
  error: (errorType: string, errorMessage: string, pagePath: string) => {
    trackEvent('error', {
      error_type: errorType,
      error_message: errorMessage,
      page_path: pagePath,
      fatal: false,
    });
  },
};

/**
 * Page-specific tracking helpers
 */
export const pageTracking = {
  /**
   * Track home page view with featured items
   */
  homePage: (featuredItemsCount: number, promotionsCount: number) => {
    trackEvent('view_home', {
      featured_items: featuredItemsCount,
      active_promotions: promotionsCount,
    });
  },

  /**
   * Track menu page view
   */
  menuPage: (category?: string, itemsCount?: number) => {
    trackEvent('view_menu', {
      ...(category && { category: category }),
      ...(itemsCount && { items_count: itemsCount }),
    });
  },

  /**
   * Track promotions page view
   */
  promotionsPage: (promotionsCount: number) => {
    trackEvent('view_promotions', {
      promotions_count: promotionsCount,
    });
  },
};

// Export everything as default as well
export default {
  trackEvent,
  analytics,
  userEngagement,
  businessEvents,
  pageTracking,
};
