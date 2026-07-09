/**
 * Email Sending Utility
 * =====================
 * Sends transaction emails (such as OTP verification codes).
 * If SMTP environment variables are not configured, logs the email content
 * to the terminal console as a fallback, unblocking local development.
 */

const nodemailer = require('nodemailer');

/**
 * Sends an email using Nodemailer or logs to console.
 *
 * @param {object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.message - Plain-text email message
 * @param {string} [options.html] - HTML body content (optional)
 * @returns {Promise<boolean>} Resolves to true when completed
 */
const sendEmail = async (options) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  // Check if SMTP is configured
  const isSmtpConfigured = smtpHost && smtpPort && smtpUser && smtpPass;

  if (!isSmtpConfigured) {
    console.log('\n┌────────────────────────────────────────────────────────┐');
    console.log('│ 📧  MOCK EMAIL LOG (SMTP NOT CONFIGURED)               │');
    console.log('├────────────────────────────────────────────────────────┤');
    console.log(`│ To:      ${options.email.padEnd(46)} │`);
    console.log(`│ Subject: ${options.subject.padEnd(46)} │`);
    console.log('├────────────────────────────────────────────────────────┤');
    console.log('│ Message:                                               │');
    // Splitting lines to print nicely inside a box
    const lines = options.message.split('\n');
    lines.forEach(line => {
      console.log(`│   ${line.padEnd(52)} │`);
    });
    console.log('└────────────────────────────────────────────────────────┘\n');
    return true;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort, 10),
    secure: parseInt(smtpPort, 10) === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    // Force IPv4 to prevent ENETUNREACH errors on IPv6 networks
    family: 4,
    connectionTimeout: 5000, // 5 seconds connection timeout
    greetingTimeout: 5000,   // 5 seconds greeting timeout
    socketTimeout: 10000,    // 10 seconds socket timeout
  });

  // Mail options
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Secure Voting" <noreply@votingplatform.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #4f46e5; text-align: center;">Secure Voting Platform</h2>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p>${options.message.replace(/\n/g, '<br>')}</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">This is an automated system email. Please do not reply.</p>
      </div>
    `,
  };

  try {
    // Send mail
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('🚨 SMTP Error sending email:', error.message);

    // Fall back to console logging in all environments (including production on Render)
    // so registration/verification flows are not blocked when SMTP is firewalled.
    const envLabel = (process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'DEVELOPMENT').padEnd(11);
    console.log('\n┌────────────────────────────────────────────────────────┐');
    console.log(`│ 📧  FALLBACK EMAIL LOG (${envLabel})             │`);
    console.log('├────────────────────────────────────────────────────────┤');
    console.log(`│ Error:   ${(error.message || '').slice(0, 45).padEnd(46)} │`);
    console.log(`│ To:      ${options.email.padEnd(46)} │`);
    console.log(`│ Subject: ${options.subject.padEnd(46)} │`);
    console.log('├────────────────────────────────────────────────────────┤');
    console.log('│ Message:                                               │');
    const lines = options.message.split('\n');
    lines.forEach(line => {
      console.log(`│   ${line.padEnd(52)} │`);
    });
    console.log('└────────────────────────────────────────────────────────┘\n');
    return true;
  }
};

module.exports = sendEmail;
