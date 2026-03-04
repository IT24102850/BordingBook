const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Create transporter
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  /**
   * Send verification email
   * @param {string} email - Recipient email address
   * @param {string} verificationToken - Verification token
   */
  async sendVerificationEmail(email, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: `"BoardingBook" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 10px;
              padding: 30px;
              color: white;
            }
            .content {
              background: white;
              color: #333;
              padding: 30px;
              border-radius: 8px;
              margin-top: 20px;
            }
            .button {
              display: inline-block;
              padding: 14px 32px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: rgba(255, 255, 255, 0.8);
              text-align: center;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              color: #856404;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 style="margin: 0; font-size: 28px;">Welcome to BoardingBook! 🎉</h1>
            
            <div class="content">
              <p style="font-size: 16px; margin-top: 0;">Hi there,</p>
              
              <p>Thank you for signing up with BoardingBook! We're excited to help you find the perfect boarding place or roommate.</p>
              
              <p>To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <div class="warning">
                <strong>⏰ Important:</strong> This verification link will expire in 24 hours.
              </div>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 14px;">
                ${verificationUrl}
              </p>
              
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666;">
                If you didn't create an account with BoardingBook, you can safely ignore this email.
              </p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} BoardingBook. All rights reserved.</p>
              <p>Making student housing simple and accessible.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to BoardingBook!
        
        Thank you for signing up! To complete your registration, please verify your email address by visiting:
        
        ${verificationUrl}
        
        This link will expire in 24 hours.
        
        If you didn't create an account, you can safely ignore this email.
        
        © ${new Date().getFullYear()} BoardingBook
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent: %s', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send welcome email after verification
   * @param {string} email - Recipient email address
   * @param {string} name - User's name
   */
  async sendWelcomeEmail(email, name) {
    const mailOptions = {
      from: `"BoardingBook" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to BoardingBook! 🏠',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 10px;
              padding: 30px;
              color: white;
            }
            .content {
              background: white;
              color: #333;
              padding: 30px;
              border-radius: 8px;
              margin-top: 20px;
            }
            .button {
              display: inline-block;
              padding: 14px 32px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 style="margin: 0; font-size: 28px;">Your Account is Verified! ✅</h1>
            
            <div class="content">
              <p style="font-size: 16px; margin-top: 0;">Hi ${name || 'there'},</p>
              
              <p>Congratulations! Your email has been successfully verified and your account is now active.</p>
              
              <p><strong>Here's what you can do now:</strong></p>
              <ul>
                <li>🔍 Search for boarding places near your campus</li>
                <li>👥 Find compatible roommates</li>
                <li>💬 Chat with property owners</li>
                <li>⭐ Save your favorite listings</li>
                <li>📝 Complete your profile</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/signin" class="button">Sign In Now</a>
              </div>
              
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666;">
                Need help? Contact us at support@boardingbook.com
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent: %s', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error for welcome email - it's not critical
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
