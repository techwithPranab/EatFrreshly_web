const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const ContactInfo = require('../models/ContactInfo');

class EmailService {
  constructor() {
    // Initialize SMTP transporter with Brevo/Sendinblue SMTP configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.BREVO_SMTP_PORT) || 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.BREVO_SMTP_USERNAME,
        pass: process.env.BREVO_SMTP_PASSWORD
      },
      tls: {
        ciphers: 'SSLv3'
      }
    });
    
    // Default sender information
    this.defaultSender = {
      name: process.env.EMAIL_SENDER_NAME || 'EatFreshly',
      email: process.env.EMAIL_SENDER_EMAIL || 'noreply@healthyrestaurant.com'
    };
    
    // Verify SMTP connection on startup
    this.verifyConnection();
  }
  
  /**
   * Verify SMTP connection
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('SMTP server connection verified successfully');
    } catch (error) {
      console.error('SMTP server connection failed:', error.message);
    }
  }

  /**
   * Load and compile email template
   * @param {string} templateName - Name of the template file
   * @param {object} data - Data to populate the template
   * @returns {Promise<string>} Compiled HTML content
   */
  async loadTemplate(templateName, data) {
    try {
      const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
      const templateContent = await fs.readFile(templatePath, 'utf8');
      const template = handlebars.compile(templateContent);
      return template(data);
    } catch (error) {
      console.error(`Error loading email template ${templateName}:`, error);
      throw new Error(`Failed to load email template: ${templateName}`);
    }
  }

  /**
   * Send email using SMTP
   * @param {object} emailData - Email configuration
   * @returns {Promise<object>} Send result
   */
  async sendEmail(emailData) {
    try {
      const senderInfo = emailData.sender || this.defaultSender;
      
      const mailOptions = {
        from: `"${senderInfo.name}" <${senderInfo.email}>`,
        to: Array.isArray(emailData.to) 
          ? emailData.to.map(recipient => 
              typeof recipient === 'string' 
                ? recipient 
                : recipient.email
            ).join(', ')
          : typeof emailData.to === 'string'
            ? emailData.to
            : emailData.to.email,
        subject: emailData.subject,
        html: emailData.htmlContent
      };
      
      if (emailData.textContent) {
        mailOptions.text = emailData.textContent;
      }
      
      if (emailData.cc && emailData.cc.length > 0) {
        mailOptions.cc = emailData.cc.map(recipient => 
          typeof recipient === 'string' 
            ? recipient 
            : recipient.email
        ).join(', ');
      }
      
      if (emailData.bcc && emailData.bcc.length > 0) {
        mailOptions.bcc = emailData.bcc.map(recipient => 
          typeof recipient === 'string' 
            ? recipient 
            : recipient.email
        ).join(', ');
      }
      
      if (emailData.replyTo) {
        mailOptions.replyTo = typeof emailData.replyTo === 'string'
          ? emailData.replyTo
          : emailData.replyTo.email;
      }
      
      // Add custom headers for tracking (if needed)
      if (emailData.tags && emailData.tags.length > 0) {
        mailOptions.headers = {
          'X-Email-Tags': emailData.tags.join(',')
        };
      }

      console.log(`📧 [SMTP] Sending email to ${mailOptions.to} with subject: "${mailOptions.subject}"`);
      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ [SMTP] Email sent successfully with messageId: ${result.messageId}`);
      return {
        success: true,
        messageId: result.messageId,
        data: result
      };
    } catch (error) {
      console.error(`❌ [SMTP] Error sending email:`, {
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response
      });
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
  }

  /**
   * Send order confirmation email
   * @param {object} orderData - Order details
   * @param {object} customerData - Customer information
   * @returns {Promise<object>} Send result
   */
  async sendOrderConfirmation(orderData, customerData) {
    console.log(`📧 [EmailService] Preparing order confirmation email for order ${orderData.orderNumber} to ${customerData.email}`);
    try {
      // Fetch contact information
      const contactInfo = await ContactInfo.getContactInfo();
      
      const templateData = {
        customerName: customerData.name,
        orderNumber: orderData.orderNumber,
        orderDate: new Date(orderData.createdAt).toLocaleDateString('en-IN'),
        orderTime: new Date(orderData.createdAt).toLocaleTimeString('en-IN'),
        items: orderData.items.map(item => ({
          name: item.menuItem?.name || item.name,
          quantity: item.quantity,
          price: `₹${item.price}`,
          total: `₹${item.quantity * item.price}`
        })),
        subtotal: `₹${orderData.subtotal}`,
        tax: `₹${orderData.tax || 0}`,
        deliveryFee: `₹${orderData.deliveryFee || 0}`,
        total: `₹${orderData.totalPrice}`,
        deliveryAddress: orderData.deliveryAddress,
        estimatedDeliveryTime: orderData.estimatedDeliveryTime ? 
          new Date(orderData.estimatedDeliveryTime).toLocaleString('en-IN') : 
          '30-45 minutes',
        restaurantName: 'EatFreshly',
        restaurantPhone: contactInfo.phone,
        restaurantEmail: contactInfo.email
      };

      console.log(`📧 [EmailService] Loading email template for order ${orderData.orderNumber}`);
      const htmlContent = await this.loadTemplate('order-confirmation', templateData);
      console.log(`📧 [EmailService] Template loaded successfully, content length: ${htmlContent.length}`);

      console.log(`📧 [EmailService] Sending order confirmation email for order ${orderData.orderNumber} to ${customerData.email}`);
      const result = await this.sendEmail({
        to: { email: customerData.email, name: customerData.name },
        subject: `Order Confirmation - ${orderData.orderNumber}`,
        htmlContent,
        tags: ['order-confirmation', 'transactional']
      });

      console.log(`📧 [EmailService] Email send result for order ${orderData.orderNumber}:`, {
        success: result.success,
        messageId: result.messageId,
        error: result.error?.message
      });

      return result;
    } catch (error) {
      console.error(`❌ [EmailService] Error sending order confirmation email for order ${orderData.orderNumber}:`, error);
      throw error;
    }
  }

  /**
   * Send order completion email
   * @param {object} orderData - Order details
   * @param {object} customerData - Customer information
   * @returns {Promise<object>} Send result
   */
  async sendOrderCompletion(orderData, customerData) {
    try {
      // Fetch contact information
      const contactInfo = await ContactInfo.getContactInfo();
      
      const templateData = {
        customerName: customerData.name,
        orderNumber: orderData.orderNumber,
        completionDate: new Date().toLocaleDateString('en-IN'),
        completionTime: new Date().toLocaleTimeString('en-IN'),
        items: orderData.items.map(item => ({
          name: item.menuItem?.name || item.name,
          quantity: item.quantity
        })),
        total: `₹${orderData.totalPrice}`,
        deliveryAddress: orderData.deliveryAddress,
        isDelivery: orderData.orderType === 'delivery',
        isPickup: orderData.orderType === 'pickup',
        restaurantName: 'EatFreshly',
        restaurantPhone: contactInfo.phone,
        restaurantAddress: contactInfo.address
      };

      const htmlContent = await this.loadTemplate('order-completion', templateData);

      return await this.sendEmail({
        to: { email: customerData.email, name: customerData.name },
        subject: `Your Order is Ready! - ${orderData.orderNumber}`,
        htmlContent,
        tags: ['order-completion', 'transactional']
      });
    } catch (error) {
      console.error('Error sending order completion email:', error);
      throw error;
    }
  }

  /**
   * Send newsletter to subscribers
   * @param {Array} subscribers - List of subscriber emails
   * @param {object} newsletterData - Newsletter content
   * @returns {Promise<Array>} Send results
   */
  async sendNewsletter(subscribers, newsletterData) {
    try {
      const templateData = {
        weekNumber: newsletterData.weekNumber || new Date().getWeek(),
        currentDate: new Date().toLocaleDateString('en-IN'),
        featuredItems: newsletterData.featuredItems || [],
        promotions: newsletterData.promotions || [],
        upcomingMenus: newsletterData.upcomingMenus || [],
        restaurantName: 'EatFreshly',
        unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe`,
        websiteUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
      };

      const htmlContent = await this.loadTemplate('newsletter', templateData);

      // Send to batches of subscribers to avoid overwhelming SMTP server
      const batchSize = 10; // Reduced batch size for SMTP
      const results = [];

      for (let i = 0; i < subscribers.length; i += batchSize) {
        const batch = subscribers.slice(i, i + batchSize);
        const batchPromises = batch.map(async (subscriber) => {
          const personalizedData = {
            ...templateData,
            subscriberName: subscriber.name || 'Valued Customer',
            unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe?token=${subscriber.unsubscribeToken}`
          };

          const personalizedContent = await this.loadTemplate('newsletter', personalizedData);

          return this.sendEmail({
            to: { email: subscriber.email, name: subscriber.name },
            subject: `Weekly Menu & Offers - Week ${templateData.weekNumber}`,
            htmlContent: personalizedContent,
            tags: ['newsletter', 'marketing']
          });
        });

        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults);

        // Add delay between batches to respect SMTP rate limits
        if (i + batchSize < subscribers.length) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Increased delay for SMTP
        }
      }

      return results;
    } catch (error) {
      console.error('Error sending newsletter:', error);
      throw error;
    }
  }

  /**
   * Send contact form confirmation email to user
   * @param {object} contactData - Contact form data
   * @returns {Promise<object>} Send result
   */
  async sendContactConfirmation(contactData) {
    try {
      // Fetch contact information
      const contactInfo = await ContactInfo.getContactInfo();
      
      const templateData = {
        customerName: contactData.name,
        inquiryType: contactData.inquiryType.charAt(0).toUpperCase() + contactData.inquiryType.slice(1),
        subject: contactData.subject,
        message: contactData.message,
        submissionDate: new Date(contactData.createdAt).toLocaleDateString('en-US'),
        submissionTime: new Date(contactData.createdAt).toLocaleTimeString('en-US'),
        confirmationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/contact/confirm/${contactData._id}`,
        restaurantName: 'EatFreshly',
        restaurantPhone: contactInfo.phone,
        restaurantEmail: contactInfo.email,
        websiteUrl: process.env.FRONTEND_URL || 'http://localhost:3001'
      };

      const htmlContent = await this.loadTemplate('contact-confirmation', templateData);

      return await this.sendEmail({
        to: { email: contactData.email, name: contactData.name },
        subject: 'Thank you for contacting EatFreshly',
        htmlContent,
        tags: ['contact-confirmation', 'transactional']
      });
    } catch (error) {
      console.error('Error sending contact confirmation email:', error);
      throw error;
    }
  }

  /**
   * Send contact notification email to admin
   * @param {object} contactData - Contact form data
   * @returns {Promise<object>} Send result
   */
  async sendContactNotification(contactData) {
    try {
      const templateData = {
        customerName: contactData.name,
        customerEmail: contactData.email,
        inquiryType: contactData.inquiryType.charAt(0).toUpperCase() + contactData.inquiryType.slice(1),
        subject: contactData.subject,
        message: contactData.message,
        submissionDate: new Date(contactData.createdAt).toLocaleDateString('en-US'),
        submissionTime: new Date(contactData.createdAt).toLocaleTimeString('en-US'),
        contactId: contactData._id,
        ipAddress: contactData.ipAddress,
        userAgent: contactData.userAgent,
        adminPanelUrl: `${process.env.ADMIN_URL || 'http://localhost:3002'}/admin/contacts/${contactData._id}`,
        restaurantName: 'EatFreshly'
      };

      const htmlContent = await this.loadTemplate('contact-notification', templateData);

      return await this.sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@healthyrestaurant.com',
        subject: `New Contact Form Submission - ${contactData.inquiryType}`,
        htmlContent,
        tags: ['contact-notification', 'admin']
      });
    } catch (error) {
      console.error('Error sending contact notification email:', error);
      throw error;
    }
  }
}

// Helper function to get week number
Date.prototype.getWeek = function() {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

module.exports = new EmailService();
