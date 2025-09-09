const {
  sendNotificationEmail,
  emailVerificationTemplate,
  passwordResetTemplate,
  loginNotificationTemplate,
  passwordChangeTemplate,
  accountSuspendedTemplate,
  welcomeTemplate,
} = require("../utils/notificationService");
const { logAudit } = require("../utils/auditLogger");
const { UserStatus } = require("@prisma/client");
const prisma = require("../config/db");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

// Constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours
const ACCESS_TOKEN_EXPIRY = "24h"; // 24 hours
const REFRESH_TOKEN_EXPIRY = "30d";

// Generate JWT Tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId, type: "access" },
    process.env.JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    }
  );

  const refreshToken = jwt.sign(
    { id: userId, type: "refresh" },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    }
  );

  return { accessToken, refreshToken };
};

// Register User
exports.registerUser = async (req, res) => {
  const { validationResult } = require("express-validator");
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { fullName, email, password, profileImageUrl, defaultCurrency } = req.body;

  // Validation
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Password strength validation
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
    });
  }

  try {
    // Check if email exists in database (including soft deleted)
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already in use. Please use another one." });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ); // 24 hours

    // Create the user
    const user = await prisma.user.create({
      data: {
        fullName,
        email: email.toLowerCase(),
        password: hashedPassword,
        profileImageUrl,
        defaultCurrency: defaultCurrency || 'NGN',
        emailVerificationToken,
        emailVerificationTokenExpires,
        emailVerifiedAt: null, // Will be set when email is verified
      },
    });

    // Send verification email using notification service (with error handling)
    try {
      const { subject, html } = emailVerificationTemplate(user, emailVerificationToken);
      await sendNotificationEmail(email, subject, html);
    } catch (emailError) {
      console.error('Registration email failed:', emailError.message);
      // Continue with registration even if email fails
    }

    await logAudit("REGISTER", user.id, { email: user.email });
    res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        status: user.status,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
  }
};

// Email verification endpoint
exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationTokenExpires: { gte: new Date() },
        deletedAt: null,
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification token." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(), // Set the current timestamp when verified
        emailVerificationToken: null,
        emailVerificationTokenExpires: null,
      },
    });

    // Send welcome email after successful verification
    const { subject, html } = welcomeTemplate(updatedUser);
    await sendNotificationEmail(updatedUser.email, subject, html);

    await logAudit("EMAIL_VERIFIED", updatedUser.id, {
      email: updatedUser.email,
    });
    res.json({
      message: "Email verified successfully. You can now log in.",
      status: updatedUser.status,
      emailVerifiedAt: updatedUser.emailVerifiedAt,
    });
  } catch (err) {
    console.error("Email verification error:", err);
    res
      .status(500)
      .json({ message: "Error verifying email", error: err.message });
  }
};

// Resend verification email
exports.resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        status: UserStatus.PENDING_VERIFICATION, // Not verified yet
        deletedAt: null,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or already verified" });
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationTokenExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken,
        emailVerificationTokenExpires,
      },
    });

    // Send verification email using notification service
    const { subject, html } = emailVerificationTemplate(user, emailVerificationToken);
    await sendNotificationEmail(email, subject, html);

    logAudit("resendVerificationEmail", user.id, { email: user.email });
    res.json({ message: "Verification email sent successfully" });
  } catch (err) {
    console.error("Resend verification error:", err);
    res
      .status(500)
      .json({
        message: "Error resending verification email",
        error: err.message,
      });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { validationResult } = require("express-validator");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // SUSPENDED: If suspended, check if time expired
    if (user.status === UserStatus.SUSPENDED) {
      if (user.lockedUntil && user.lockedUntil <= new Date()) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            status: UserStatus.PENDING_VERIFICATION,
            lockedUntil: null,
            loginAttempts: 0,
          },
        });
      } else {
        // Send suspension notification (non-blocking - don't await)
        const { subject, html } = accountSuspendedTemplate(user);
        sendNotificationEmail(user.email, subject, html).catch(err => 
          console.error('Suspension notification email failed:', err.message)
        );
        
        const remainingTime = Math.ceil(
          (user.lockedUntil - new Date()) / (1000 * 60)
        );
        return res.status(423).json({
          message: `Account suspended. Try again in ${remainingTime} minutes.`,
        });
      }
    }

    // INACTIVE: If last login > 7 days
    if (
      user.lastLoginAt &&
      new Date() - new Date(user.lastLoginAt) > 7 * 24 * 60 * 60 * 1000
    ) {
      await prisma.user.update({
        where: { id: user.id },
        data: { status: UserStatus.INACTIVE },
      });
      // TODO: Send inactivity warning email on 5th day (node-cron)
      // TODO: Schedule deletion after 12 hours (node-cron)
      return res.status(403).json({
        message:
          "Account is inactive due to inactivity. Please contact support.",
        status: UserStatus.INACTIVE,
      });
    }

    // Check if email is verified
    if (user.status !== UserStatus.ACTIVE) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
        status: user.status,
        needsVerification: true,
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment login attempts
      const loginAttempts = user.loginAttempts + 1;
      const updateData = { loginAttempts };

      // SUSPENDED: Suspend account if max attempts reached
      if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + 5 * 60 * 60 * 1000); // 5 hours
        updateData.loginAttempts = 0;
        updateData.status = UserStatus.SUSPENDED;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Get device info and IP
    const deviceInfo = req.headers["user-agent"] || "Unknown";
    const ipAddress =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.ip;

    // Create session record
    await prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours expiry for access token
        deviceInfo,
        ipAddress,
        revoked: false,
      },
    });

    // Update user login info
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginAttempts: 0,
        lockedUntil: null,
        refreshToken,
        refreshTokenExpiry,
      },
    });

    await logAudit("LOGIN", user.id, { email: user.email });
    
    // Send login notification (non-blocking - don't await)
    const { subject, html } = loginNotificationTemplate(user);
    sendNotificationEmail(user.email, subject, html).catch(err => 
      console.error('Login notification email failed:', err.message)
    );
    
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        status: user.status,
        emailVerifiedAt: user.emailVerifiedAt,
        profileImageUrl: user.profileImageUrl,
        defaultCurrency: user.defaultCurrency,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    // Revoke current session (access token)
    if (token) {
      await prisma.session.updateMany({
        where: { userId: req.user.id, token, revoked: false },
        data: { revoked: true },
      });
    }
    
    // Clear refresh token from database
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        refreshToken: null,
        refreshTokenExpiry: null,
      },
    });
    
    await logAudit("LOGOUT", req.user.id, { 
      email: req.user.email,
      sessionRevoked: true 
    });
    
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Error logging out", error: err.message });
  }
};

// Get User Info
exports.getUserInfo = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        profileImageUrl: true,
        defaultCurrency: true,
        status: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Get user info error:", err);
    res
      .status(500)
      .json({ message: "Error fetching user info", error: err.message });
  }
};

// Password Reset Request
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
      },
    });

    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    const passwordResetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetTokenExpires,
      },
    });

    // Send password reset email using notification service
    try {
      const { subject, html } = passwordResetTemplate(user, passwordResetToken);
      await sendNotificationEmail(email, subject, html);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError.message);
    }

    if (user)
      logAudit("PASSWORD_RESET_REQUEST", user.id, { email: user.email });
    res.json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res
      .status(500)
      .json({
        message: "Error processing password reset request",
        error: err.message,
      });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { validationResult } = require("express-validator");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: "Token and new password are required" });
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetTokenExpires: { gte: new Date() },
        deletedAt: null,
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpires: null,
        // Invalidate all refresh tokens
        refreshToken: null,
        refreshTokenExpiry: null,
      },
    });

    await logAudit("PASSWORD_RESET", user.id, { email: user.email });
    // Send password change notification
    const { subject, html } = passwordChangeTemplate(user);
    await sendNotificationEmail(user.email, subject, html);
    res.json({
      message:
        "Password reset successfully. Please log in with your new password.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res
      .status(500)
      .json({ message: "Error resetting password", error: err.message });
  }
};

// Refresh Token
exports.refreshToken = async (req, res) => {
  const { validationResult } = require("express-validator");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    // Find user with matching refresh token
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.id,
        refreshToken,
        refreshTokenExpiry: { gte: new Date() },
        deletedAt: null,
      },
    });

    if (!user) {
      // If token reuse detected, revoke all sessions and refresh tokens for user
      await prisma.user.update({
        where: { id: decoded.id },
        data: {
          refreshToken: null,
          refreshTokenExpiry: null,
        },
      });
      await prisma.session.updateMany({
        where: { userId: decoded.id },
        data: { revoked: true },
      });
      return res
        .status(401)
        .json({
          message: "Invalid or reused refresh token. All sessions revoked.",
        });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user.id
    );
    const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Get device info and IP for the new session
    const deviceInfo = req.headers["user-agent"] || "Unknown";
    const ipAddress =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.ip;

    // IMPORTANT: Invalidate all existing sessions/access tokens for this user
    await prisma.session.updateMany({
      where: { userId: user.id, revoked: false },
      data: { revoked: true },
    });

    // Create new session record for the new access token
    await prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours expiry for access token
        deviceInfo,
        ipAddress,
        revoked: false,
      },
    });

    // Update refresh token in database (rotate)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: newRefreshToken,
        refreshTokenExpiry,
      },
    });

    await logAudit("REFRESH_TOKEN", user.id, { 
      email: user.email,
      oldTokensRevoked: true 
    });

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  const { fullName, email, profileImageUrl, password, defaultCurrency, currency } = req.body;
  const updates = {};
  if (fullName) updates.fullName = fullName;
  if (email) updates.email = email.toLowerCase();
  if (profileImageUrl !== undefined) updates.profileImageUrl = profileImageUrl;
  if (password) {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({
          message:
            "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
        });
    }
    updates.password = await bcrypt.hash(password, 12);
  }
  if (defaultCurrency) updates.defaultCurrency = defaultCurrency;
  if (currency) updates.defaultCurrency = currency;
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updates,
    });
    await logAudit("UPDATE_PROFILE", req.user.id, { email: user.email });
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Update profile error:", err);
    res
      .status(500)
      .json({ message: "Error updating profile", error: err.message });
  }
};

// Logout from all devices
exports.logoutAll = async (req, res) => {
  try {
    // Revoke ALL sessions for this user
    await prisma.session.updateMany({
      where: { userId: req.user.id, revoked: false },
      data: { revoked: true },
    });
    
    // Clear refresh token from database
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        refreshToken: null,
        refreshTokenExpiry: null,
      },
    });
    
    await logAudit("LOGOUT_ALL", req.user.id, { 
      email: req.user.email,
      allSessionsRevoked: true 
    });
    
    res.json({ message: "Logged out from all devices successfully" });
  } catch (err) {
    console.error("Logout all error:", err);
    res.status(500).json({ message: "Error logging out from all devices", error: err.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current password and new password are required" });
  }

  try {
    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Validate new password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "New password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword }
    });

    await logAudit("CHANGE_PASSWORD", req.user.id, { email: user.email });
    
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Error changing password", error: err.message });
  }
};

// Delete Account (Soft Delete)
exports.deleteAccount = async (req, res) => {
  try {
    // Remove all sessions for the user
    await prisma.session.deleteMany({
      where: { userId: req.user.id },
    });
    // Delete the user from the database
    await prisma.user.delete({
      where: { id: req.user.id },
    });
    await logAudit("DELETE_ACCOUNT", req.user.id, { email: req.user.email });
    res.json({ message: "Account deleted successfully." });
  } catch (err) {
    console.error("Delete account error:", err);
    res
      .status(500)
      .json({ message: "Error deleting account", error: err.message });
  }
};
