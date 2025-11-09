const nodemailer = require('nodemailer');
require('dotenv').config();

async function testSMTPConnection() {
  console.log('Testing SMTP connection with Brevo...');
  
  // Create transporter
  const transporter = nodemailer.createTransport({
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

  try {
    // Verify connection
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    // Send test email
    const testEmail = {
      from: `"${process.env.EMAIL_SENDER_NAME}" <${process.env.EMAIL_SENDER_EMAIL}>`,
      to: process.env.TEST_EMAIL || 'test@example.com',
      subject: 'Test Email from Healthy Restaurant',
      html: `
        <h2>SMTP Test Email</h2>
        <p>This is a test email to verify SMTP configuration.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Configuration:</strong></p>
        <ul>
          <li>Host: ${process.env.BREVO_SMTP_HOST}</li>
          <li>Port: ${process.env.BREVO_SMTP_PORT}</li>
          <li>Username: ${process.env.BREVO_SMTP_USERNAME}</li>
          <li>Sender: ${process.env.EMAIL_SENDER_EMAIL}</li>
        </ul>
      `,
      text: `
        SMTP Test Email
        This is a test email to verify SMTP configuration.
        Timestamp: ${new Date().toISOString()}
        
        Configuration:
        Host: ${process.env.BREVO_SMTP_HOST}
        Port: ${process.env.BREVO_SMTP_PORT}
        Username: ${process.env.BREVO_SMTP_USERNAME}
        Sender: ${process.env.EMAIL_SENDER_EMAIL}
      `
    };

    if (process.env.TEST_EMAIL) {
      console.log(`Sending test email to: ${process.env.TEST_EMAIL}`);
      const result = await transporter.sendMail(testEmail);
      console.log('✅ Test email sent successfully!');
      console.log('Message ID:', result.messageId);
    } else {
      console.log('⚠️  Set TEST_EMAIL environment variable to send test email');
    }

  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    console.error('Please check your SMTP configuration:');
    console.error('- BREVO_SMTP_HOST:', process.env.BREVO_SMTP_HOST || 'Not set');
    console.error('- BREVO_SMTP_PORT:', process.env.BREVO_SMTP_PORT || 'Not set');
    console.error('- BREVO_SMTP_USERNAME:', process.env.BREVO_SMTP_USERNAME ? '✓ Set' : '❌ Not set');
    console.error('- BREVO_SMTP_PASSWORD:', process.env.BREVO_SMTP_PASSWORD ? '✓ Set' : '❌ Not set');
    console.error('- EMAIL_SENDER_EMAIL:', process.env.EMAIL_SENDER_EMAIL || 'Not set');
    
    process.exit(1);
  }
}

// Run the test
testSMTPConnection()
  .then(() => {
    console.log('\n🎉 SMTP test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 SMTP test failed:', error.message);
    process.exit(1);
  });
