

import crypto from "crypto";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendOTPEmail, sendPasswordResetEmail } from "../utils/mailer.js";

// GENERATE OTP  6 digit random number

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
  // always 6 digits  100000 to 999999
};

// SEND OTP

const sendOTP = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  if (user.isEmailVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  // generate OTP
  const otp = generateOTP();
  // save OTP in DB with 10 min expiry
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save({ validateBeforeSave: false });

  try {
    await sendOTPEmail(user.email, otp);
  } catch (error) {
    user.otp = null;
    user.otpExpiry = null;
    await user.save({ validateBeforeSave: false });

    console.error(" sendOTPEmail failed:", error.message);

    if (error.responseCode === 535) {
      throw new ApiError(
        500,
        "Email server rejected login. Check EMAIL_USER / EMAIL_PASS (Gmail App Password) in .env"
      );
    }
    if (error.code === "EENVELOPE" || error.code === "EMESSAGE") {
      throw new ApiError(500, "Invalid recipient email address");
    }
    if (error.code === "ETIMEDOUT" || error.code === "ECONNECTION") {
      throw new ApiError(500, "Could not connect to email server. Check your internet connection");
    }

    throw new ApiError(500, `Failed to send OTP email: ${error.message}`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "OTP sent to your email successfully"));
});

// VERIFY OTP

const verifyOTP = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  if (!otp) throw new ApiError(400, "OTP is required");

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  if (!user.otp || !user.otpExpiry) {
    throw new ApiError(400, "No OTP was requested. Please request a new OTP");
  }

  // check OTP matches
  if (user.otp !== otp) {
    throw new ApiError(400, "Invalid OTP");
  }

  // check OTP not expired
  if (user.otpExpiry < new Date()) {
    throw new ApiError(400, "OTP has expired. Please request a new one");
  }

  // mark email as verified
  user.isEmailVerified = true;
  user.otp = null;
  user.otpExpiry = null;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email verified successfully"));
});

// FORGOT PASSWORD  send reset link

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found with this email");

  // generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  user.passwordResetToken = resetToken;
  user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user.email, resetToken);
  } catch (error) {
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;
    await user.save({ validateBeforeSave: false });

    console.error(" sendPasswordResetEmail failed:", error.message);

    if (error.responseCode === 535) {
      throw new ApiError(
        500,
        "Email server rejected login. Check EMAIL_USER / EMAIL_PASS (Gmail App Password) in .env"
      );
    }
    if (error.code === "EENVELOPE" || error.code === "EMESSAGE") {
      throw new ApiError(500, "Invalid recipient email address");
    }
    if (error.code === "ETIMEDOUT" || error.code === "ECONNECTION") {
      throw new ApiError(500, "Could not connect to email server. Check your internet connection");
    }

    throw new ApiError(500, `Failed to send password reset email: ${error.message}`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset link sent to your email"));
});

// RESET PASSWORD  using token

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new ApiError(400, "Token and new password are required");
  }

  // find user by reset token
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  // update password
  user.password = newPassword;
  user.passwordResetToken = null;
  user.passwordResetExpiry = null;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

export { sendOTP, verifyOTP, forgotPassword, resetPassword };