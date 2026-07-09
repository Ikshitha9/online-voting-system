/**
 * Authentication Controller
 * =========================
 * Implements JWT authentication, register, OTP email verification,
 * refresh token rotation, logout, and profile updates.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const sendEmail = require('../utils/sendEmail');
const generateOTP = require('../utils/generateOTP');
const logAudit = require('../utils/auditLogger');

/**
 * Generates JWT Access Token (15m validity)
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
};

/**
 * Generates JWT Refresh Token (7d validity)
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

// ─── Controller Methods ──────────────────────────────────────────────────────

/**
 * Register a new voter or admin
 */
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role, adminKey } = req.body;

    // Check if user already exists (fully registered)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Role verification (if registering as admin)
    let finalRole = 'voter';
    if (role === 'admin') {
      const serverAdminKey = process.env.ADMIN_REGISTRATION_KEY || 'SecretAdminKey123';
      if (adminKey !== serverAdminKey) {
        return res.status(400).json({
          success: false,
          message: 'Invalid administrative registration key.',
        });
      }
      finalRole = 'admin';
    }

    // Hash password before storing in temporary OTP record
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Clean up any previous pending OTP records for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Generate & store OTP with pending user data (NO User record created yet)
    const otpCode = generateOTP();
    await OTP.create({
      email: email.toLowerCase(),
      otp: otpCode,
      pendingUser: {
        fullName,
        password: hashedPassword,
        role: finalRole,
      },
    });

    // Attempt to send verification email
    await sendEmail({
      email: email.toLowerCase(),
      subject: 'Verify your account - OTP Code',
      message: `Welcome to the Secure Online Voting Platform, ${fullName}!\n\nYour 6-digit verification code is: ${otpCode}\n\nThis code is valid for 10 minutes. If you did not request this, please ignore this email.`,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for the verification code.',
      email: email.toLowerCase(),
    });
  } catch (error) {
    console.error('🚨 Register error:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.',
    });
  }
};

/**
 * Verify registered user account using email OTP
 * Creates the User record only AFTER successful OTP verification.
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and OTP code.',
      });
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({ email: email.toLowerCase(), otp });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP verification code.',
      });
    }

    let user;

    // Check if a User already exists (resend OTP scenario for existing unverified user)
    user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Existing user — just mark as verified
      user.isVerified = true;
      await user.save();
    } else if (otpRecord.pendingUser && otpRecord.pendingUser.fullName) {
      // New registration — create the User now with the pre-hashed password
      user = new User({
        fullName: otpRecord.pendingUser.fullName,
        email: email.toLowerCase(),
        password: otpRecord.pendingUser.password,
        role: otpRecord.pendingUser.role || 'voter',
        isVerified: true,
      });
      // Skip the pre-save password hashing since we already hashed it
      user.$skipPasswordHash = true;
      await user.save();
    } else {
      return res.status(404).json({
        success: false,
        message: 'No pending registration found for this email.',
      });
    }

    // Clean up OTP records
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Generate credentials so user is logged in automatically after OTP check
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    // Audit log
    await logAudit(
      'OTP_VERIFIED',
      user._id,
      `Verified email successfully: ${user.email}`,
      req
    );

    res.status(200).json({
      success: true,
      message: 'Account verified successfully!',
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('🚨 Verify OTP error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification.',
    });
  }
};

/**
 * Resend OTP code to voter
 */
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address.',
      });
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user already exists and is verified
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This account is already verified.',
      });
    }

    // Check for a pending OTP record (covers both existing unverified users and new pending registrations)
    const existingOTP = await OTP.findOne({ email: normalizedEmail });
    if (!existingUser && !existingOTP) {
      return res.status(404).json({
        success: false,
        message: 'No pending registration found. Please register first.',
      });
    }

    // Preserve pending user data if it exists
    const pendingUser = existingOTP?.pendingUser || undefined;

    // Clean up old OTP codes
    await OTP.deleteMany({ email: normalizedEmail });

    // Generate new OTP
    const otpCode = generateOTP();
    await OTP.create({
      email: normalizedEmail,
      otp: otpCode,
      pendingUser,
    });

    // Send email
    await sendEmail({
      email: normalizedEmail,
      subject: 'Verify your account - New OTP Code',
      message: `Your new 6-digit verification code is: ${otpCode}\n\nThis code is valid for 10 minutes.`,
    });

    res.status(200).json({
      success: true,
      message: 'A new OTP code has been sent to your email.',
    });
  } catch (error) {
    console.error('🚨 Resend OTP error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error while resending OTP.',
    });
  }
};

/**
 * Log in voter or administrator
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password.',
      });
    }

    // Query user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      await logAudit(
        'LOGIN_FAILED',
        null,
        `Failed login attempt for: ${email}`,
        req
      );
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    // Tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Log security audit
    await logAudit(
      'LOGIN',
      user._id,
      `User logged in successfully: ${user.email}`,
      req
    );

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('🚨 Login error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
};

/**
 * Refresh JWT access tokens (token rotation support)
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required.',
      });
    }

    // Verify token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user with this token
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token.',
      });
    }

    // Generate new pair (Token Rotation)
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('🚨 Refresh token error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token refresh failed.',
    });
  }
};

/**
 * Get profile data of currently authenticated user
 */
exports.getMe = async (req, res) => {
  try {
    // req.user is populated by protect middleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error('🚨 getMe error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile.',
    });
  }
};

/**
 * Edit profile fields (Name and Password)
 */
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    if (fullName) {
      user.fullName = fullName;
    }

    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long.',
        });
      }
      user.password = password; // hashes automatically in userSchema pre-save
    }

    await user.save();

    await logAudit(
      'PROFILE_UPDATED',
      user._id,
      `User updated profile fields: ${fullName ? 'name' : ''} ${password ? 'password' : ''}`,
      req
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user,
    });
  } catch (error) {
    console.error('🚨 Update profile error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile.',
    });
  }
};

/**
 * Sign out user & invalidate refresh tokens
 */
exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    console.error('🚨 Logout error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error during logout.',
    });
  }
};
