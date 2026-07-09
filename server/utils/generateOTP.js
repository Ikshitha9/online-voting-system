/**
 * OTP Generator Utility
 * =====================
 * Generates cryptographically secure 6-digit one-time passwords.
 * Uses Node.js crypto module for better randomness than Math.random().
 */

const crypto = require('crypto');

/**
 * Generates a 6-digit numeric OTP.
 * Uses crypto.randomInt for cryptographically secure random numbers.
 *
 * @returns {string} A 6-digit OTP string (e.g., "042891")
 *
 * @example
 * const otp = generateOTP();
 * console.log(otp); // "528491"
 */
const generateOTP = () => {
  // Generate a random integer between 100000 and 999999 (inclusive)
  // This ensures the OTP is always exactly 6 digits
  const otp = crypto.randomInt(100000, 1000000);
  return otp.toString();
};

module.exports = generateOTP;
