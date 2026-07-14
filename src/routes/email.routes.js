import { Router } from "express";
import {
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
} from "../controllers/email.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Email
 *   description: OTP verification and password reset via email
 */

/**
 * @swagger
 * /email/send-otp:
 *   post:
 *     summary: Send OTP to logged-in user's email
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.route("/send-otp").post(verifyJWT, sendOTP);

/**
 * @swagger
 * /email/verify-otp:
 *   post:
 *     summary: Verify OTP to confirm email
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.route("/verify-otp").post(verifyJWT, verifyOTP);

/**
 * @swagger
 * /email/forgot-password:
 *   post:
 *     summary: Send password reset link to email
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset link sent successfully
 *       404:
 *         description: User not found with this email
 */
router.route("/forgot-password").post(forgotPassword);

/**
 * @swagger
 * /email/reset-password:
 *   post:
 *     summary: Reset password using token from email
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired reset token
 */
router.route("/reset-password").post(resetPassword);

export default router;