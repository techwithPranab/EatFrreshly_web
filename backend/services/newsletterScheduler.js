const cron = require('node-cron');
const Subscriber = require('../models/Subscriber');
const MenuItem = require('../models/MenuItem');
const Promotion = require('../models/Promotion');
const EmailLog = require('../models/EmailLog');
const emailService = require('./emailService');

class NewsletterScheduler {
  constructor() {
    this.isRunning = false;
  }

  // Start the newsletter scheduler
  start() {
    // Schedule newsletter to run every Monday at 9:00 AM
    cron.schedule('0 9 * * 1', async () => {
      if (!this.isRunning) {
        await this.sendWeeklyNewsletter();
      }
    });

    console.log('Newsletter scheduler started - will run every Monday at 9:00 AM');
  }

  // Send weekly newsletter
  async sendWeeklyNewsletter() {
    try {
      this.isRunning = true;
      console.log('Starting weekly newsletter send...');

      // Get active subscribers who want newsletters
      const subscribers = await Subscriber.find({
        isActive: true,
        'preferences.newsletter': true
      }).select('email name unsubscribeToken preferences');

      if (subscribers.length === 0) {
        console.log('No active newsletter subscribers found');
        return;
      }

      // Get newsletter content
      const newsletterData = await this.generateNewsletterContent();

      // Send newsletter to all subscribers
      const results = await emailService.sendNewsletter(subscribers, newsletterData);

      // Log results
      let successCount = 0;
      let failureCount = 0;

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          successCount++;
        } else {
          failureCount++;
          console.error(`Failed to send newsletter to ${subscribers[index].email}:`, 
            result.reason || result.value.error);
        }
      });

      console.log(`Newsletter send completed: ${successCount} sent, ${failureCount} failed`);

    } catch (error) {
      console.error('Error sending weekly newsletter:', error);
    } finally {
      this.isRunning = false;
    }
  }

  // Generate newsletter content
  async generateNewsletterContent() {
    const weekNumber = new Date().getWeek();
    
    // Get featured menu items
    const featuredItems = await MenuItem.find({
      isAvailable: true,
      isFeatured: true
    })
    .limit(6)
    .select('name description price category imageUrl')
    .lean();

    // Get active promotions
    const promotions = await Promotion.find({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    })
    .limit(3)
    .select('title description discountType discountValue promoCode')
    .lean();

    // Generate upcoming menu for next 7 days
    const upcomingMenus = await this.generateUpcomingMenus();

    return {
      weekNumber,
      featuredItems: featuredItems.map(item => ({
        name: item.name,
        description: item.description || 'Delicious and healthy meal option',
        price: item.price,
        icon: this.getCategoryIcon(item.category)
      })),
      promotions: promotions.map(promo => ({
        title: promo.title,
        description: promo.description,
        code: promo.promoCode
      })),
      upcomingMenus
    };
  }

  // Generate upcoming menus for the week
  async generateUpcomingMenus() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const categories = ['Breakfast', 'Lunch', 'Dinner'];
    
    const upcomingMenus = [];

    for (let i = 0; i < 7; i++) {
      const dayItems = [];
      
      for (const category of categories) {
        const items = await MenuItem.aggregate([
          { 
            $match: { 
              isAvailable: true, 
              category: category.toLowerCase() 
            } 
          },
          { $sample: { size: 2 } },
          { 
            $project: { 
              name: 1, 
              price: 1 
            } 
          }
        ]);

        dayItems.push(...items);
      }

      upcomingMenus.push({
        day: days[i],
        items: dayItems
      });
    }

    return upcomingMenus;
  }

  // Get emoji icon for category
  getCategoryIcon(category) {
    const icons = {
      'breakfast': '🍳',
      'lunch': '🥗',
      'dinner': '🍽️',
      'appetizer': '🥪',
      'dessert': '🍰',
      'beverage': '🥤',
      'snack': '🍿',
      'main course': '🍖',
      'salad': '🥗',
      'soup': '🍲'
    };

    return icons[category?.toLowerCase()] || '🍽️';
  }

  // Manual trigger for testing
  async sendTestNewsletter(email = null) {
    try {
      console.log('Sending test newsletter...');

      let subscribers;
      if (email) {
        const subscriber = await Subscriber.findOne({ email, isActive: true });
        if (!subscriber) {
          throw new Error('Subscriber not found or inactive');
        }
        subscribers = [subscriber];
      } else {
        subscribers = await Subscriber.find({
          isActive: true,
          'preferences.newsletter': true
        }).limit(5); // Limit for testing
      }

      if (subscribers.length === 0) {
        console.log('No subscribers found for test');
        return;
      }

      const newsletterData = await this.generateNewsletterContent();
      const results = await emailService.sendNewsletter(subscribers, newsletterData);

      console.log('Test newsletter sent:', results.length, 'emails processed');
      return results;

    } catch (error) {
      console.error('Error sending test newsletter:', error);
      throw error;
    }
  }

  // Get newsletter statistics
  async getNewsletterStats(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await EmailLog.getEmailStats({
        templateType: 'newsletter',
        createdAt: { $gte: startDate }
      });

      const subscriberStats = await Subscriber.aggregate([
        {
          $group: {
            _id: null,
            totalSubscribers: { $sum: 1 },
            activeSubscribers: {
              $sum: { $cond: ['$isActive', 1, 0] }
            },
            newSubscribers: {
              $sum: {
                $cond: [
                  { $gte: ['$subscribedDate', startDate] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      return {
        email: stats[0] || {
          totalSent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          deliveryRate: 0,
          openRate: 0,
          clickRate: 0
        },
        subscribers: subscriberStats[0] || {
          totalSubscribers: 0,
          activeSubscribers: 0,
          newSubscribers: 0
        }
      };

    } catch (error) {
      console.error('Error getting newsletter stats:', error);
      throw error;
    }
  }
}

module.exports = new NewsletterScheduler();
