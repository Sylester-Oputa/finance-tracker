const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  registerUser,
  loginUser,
  getUserInfo,
  verifyEmail,
  resendVerificationEmail,
  refreshToken,
  logout,
  logoutAll,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/authController");

const router = express.Router();
const { body } = require("express-validator");

// Authentication routes
router.post(
  "/register",
  [
    body("fullName").trim().notEmpty().isLength({ min: 2, max: 50 }),
    body("email").trim().isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 8, max: 100 }),
    body("profileImageUrl").optional().isString(),
    body("defaultCurrency")
      .optional()
      .isIn([
        "NGN",
        "USD",
        "EUR",
        "GBP",
        "JPY",
        "CAD",
        "AUD",
        "CHF",
        "CNY",
        "INR",
        "RUB",
        "ZAR",
        "BRL",
        "MXN",
        "SGD",
        "HKD",
        "KRW",
        "SEK",
        "NOK",
        "DKK",
        "TRY",
        "AED",
        "SAR",
        "KES",
        "GHS",
        "PKR",
        "THB",
        "IDR",
        "MYR",
        "ARS",
      ])
      .withMessage("Currency must be one of: NGN, USD, EUR, GBP, JPY"),
  ],
  registerUser
);

router.post(
  "/login",
  [
    body("email").trim().isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 8, max: 100 }),
  ],
  loginUser
);

router.post(
  "/refresh-token",
  [body("refreshToken").isString().notEmpty()],
  refreshToken
);

router.post("/logout", protect, logout);
router.post("/logout-all", protect, logoutAll);

// Email verification routes
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post(
  "/reset-password",
  [
    body("token").isString().notEmpty(),
    body("newPassword").isString().isLength({ min: 8, max: 100 }),
  ],
  resetPassword
);

// Protected routes
router.get("/getUser", protect, getUserInfo);

// Update profile
router.put(
  "/update-profile",
  protect,
  [
    body("fullName").optional().trim().isLength({ min: 2, max: 50 }),
    body("email").optional().trim().isEmail().normalizeEmail(),
    body("profileImageUrl").optional().isURL(),
    body("password").optional().isString().isLength({ min: 8, max: 100 }),
  ],
  updateProfile
);

// Profile route (alternative endpoint)
router.put(
  "/profile",
  protect,
  [
    body("fullName").optional().trim().isLength({ min: 2, max: 50 }),
    body("email").optional().trim().isEmail().normalizeEmail(),
    body("profileImageUrl").optional().isString(),
    body("currency").optional().isString(),
  ],
  updateProfile
);

// Change password route
router.put(
  "/change-password",
  protect,
  [
    body("currentPassword").isString().notEmpty(),
    body("newPassword").isString().isLength({ min: 8, max: 100 }),
  ],
  changePassword
);

// Delete account
router.delete("/delete-account", protect, deleteAccount);

// File upload route
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;
  res.status(200).json({ imageUrl });
});

module.exports = router;
