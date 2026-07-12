import { Router } from "express";
import {
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
} from "../controllers/email.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// protected routes  need login
router.route("/send-otp").post(verifyJWT, sendOTP);
router.route("/verify-otp").post(verifyJWT, verifyOTP);

// public routes  no login needed
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

export default router;