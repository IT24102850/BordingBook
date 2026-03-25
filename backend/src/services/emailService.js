const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'BoardingBook <onboarding@resend.dev>';

// DEV ONLY: redirect all emails to one test address when DEV_TEST_EMAIL is set
const resolveRecipient = (email) =>
  process.env.DEV_TEST_EMAIL || email;

/**
 * Send email verification link after sign-up
 */
async function sendVerificationEmail(email, verificationToken) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: resolveRecipient(email),
    subject: 'Verify your BoardingBook account',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;background:#0f1425;margin:0;padding:30px;">
        <div style="max-width:560px;margin:0 auto;background:#1e2436;border-radius:12px;padding:36px;border:1px solid rgba(129,140,248,0.2);">
          <div style="text-align:center;margin-bottom:28px;">
            <div style="display:inline-block;background:linear-gradient(135deg,#818cf8,#22d3ee);border-radius:10px;padding:12px 20px;">
              <span style="color:white;font-size:18px;font-weight:bold;">BoardingBook</span>
            </div>
          </div>
          <h2 style="color:#ffffff;text-align:center;margin:0 0 8px;">Verify your email</h2>
          <p style="color:#94a3b8;text-align:center;margin:0 0 28px;font-size:14px;">Click the button below to activate your account.</p>
          <div style="text-align:center;margin-bottom:28px;">
            <a href="${verificationUrl}" style="display:inline-block;background:linear-gradient(135deg,#818cf8,#22d3ee);color:white;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:600;font-size:15px;">
              Verify Email Address
            </a>
          </div>
          <p style="color:#64748b;font-size:12px;text-align:center;margin:0 0 8px;">This link expires in 24 hours.</p>
          <p style="color:#64748b;font-size:12px;text-align:center;margin:0;">If you didn't create an account, you can safely ignore this email.</p>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0;" />
          <p style="color:#475569;font-size:11px;text-align:center;margin:0;">Can't click the button? Copy this link:<br/>
            <span style="color:#818cf8;word-break:break-all;">${verificationUrl}</span>
          </p>
        </div>
      </body>
      </html>
    `,
  });

  if (error) throw new Error(error.message);
}

/**
 * Send welcome email after successful verification
 */
async function sendWelcomeEmail(email, name) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: resolveRecipient(email),
    subject: 'Welcome to BoardingBook!',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;background:#0f1425;margin:0;padding:30px;">
        <div style="max-width:560px;margin:0 auto;background:#1e2436;border-radius:12px;padding:36px;border:1px solid rgba(129,140,248,0.2);">
          <div style="text-align:center;margin-bottom:28px;">
            <div style="display:inline-block;background:linear-gradient(135deg,#818cf8,#22d3ee);border-radius:10px;padding:12px 20px;">
              <span style="color:white;font-size:18px;font-weight:bold;">BoardingBook</span>
            </div>
          </div>
          <h2 style="color:#ffffff;text-align:center;margin:0 0 8px;">You're all set, ${name || 'there'}!</h2>
          <p style="color:#94a3b8;text-align:center;margin:0 0 28px;font-size:14px;">Your email has been verified and your account is now active.</p>
          <div style="text-align:center;">
            <a href="${process.env.FRONTEND_URL}/signin" style="display:inline-block;background:linear-gradient(135deg,#818cf8,#22d3ee);color:white;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:600;font-size:15px;">
              Sign In Now
            </a>
          </div>
        </div>
      </body>
      </html>
    `,
  });

  if (error) console.error('Welcome email failed:', error.message);
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: resolveRecipient(email),
    subject: 'Reset your BoardingBook password',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;background:#0f1425;margin:0;padding:30px;">
        <div style="max-width:560px;margin:0 auto;background:#1e2436;border-radius:12px;padding:36px;border:1px solid rgba(129,140,248,0.2);">
          <div style="text-align:center;margin-bottom:28px;">
            <div style="display:inline-block;background:linear-gradient(135deg,#818cf8,#22d3ee);border-radius:10px;padding:12px 20px;">
              <span style="color:white;font-size:18px;font-weight:bold;">BoardingBook</span>
            </div>
          </div>
          <h2 style="color:#ffffff;text-align:center;margin:0 0 8px;">Reset your password</h2>
          <p style="color:#94a3b8;text-align:center;margin:0 0 28px;font-size:14px;">Click the button below to set a new password. This link expires in 1 hour.</p>
          <div style="text-align:center;margin-bottom:28px;">
            <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#818cf8,#22d3ee);color:white;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:600;font-size:15px;">
              Reset Password
            </a>
          </div>
          <p style="color:#64748b;font-size:12px;text-align:center;margin:0 0 8px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0;" />
          <p style="color:#475569;font-size:11px;text-align:center;margin:0;">Can't click the button? Copy this link:<br/>
            <span style="color:#818cf8;word-break:break-all;">${resetUrl}</span>
          </p>
        </div>
      </body>
      </html>
    `,
  });

  if (error) throw new Error(error.message);
}

module.exports = { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail };
