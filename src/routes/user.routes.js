import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  updateAccountDetails,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User authentication and profile management
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [fullName, email, username, password, avatar]
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Eman Nazir
 *               email:
 *                 type: string
 *                 example: eman@example.com
 *               username:
 *                 type: string
 *                 example: emannazir
 *               password:
 *                 type: string
 *                 example: securepass123
 *               avatar:
 *                 type: string
 *                 format: binary
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: User with email or username already exists
 */
router.route("/register").post(
  authLimiter,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user and receive access + refresh tokens
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: eman@example.com
 *               password:
 *                 type: string
 *                 example: securepass123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User does not exist
 */
router.route("/login").post(authLimiter, loginUser);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.route("/logout").post(verifyJWT, logoutUser);

/**
 * @swagger
 * /users/refresh-token:
 *   post:
 *     summary: Get new access token using refresh token
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Access token refreshed
 *       401:
 *         description: Invalid or expired refresh token
 */
router.route("/refresh-token").post(refreshAccessToken);

/**
 * @swagger
 * /users/change-password:
 *   post:
 *     summary: Change current user's password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid old password
 */
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

/**
 * @swagger
 * /users/current-user:
 *   get:
 *     summary: Get currently logged in user's details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.route("/current-user").get(verifyJWT, getCurrentUser);

/**
 * @swagger
 * /users/update-account:
 *   patch:
 *     summary: Update account details (fullName, email)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account details updated successfully
 */
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

/**
 * @swagger
 * /users/avatar:
 *   patch:
 *     summary: Update user avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 */
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

/**
 * @swagger
 * /users/cover-image:
 *   patch:
 *     summary: Update user cover image
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cover image updated successfully
 */
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

/**
 * @swagger
 * /users/c/{username}:
 *   get:
 *     summary: Get a user's channel profile with subscriber counts
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Channel profile fetched successfully
 *       404:
 *         description: Channel does not exist
 */
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

/**
 * @swagger
 * /users/history:
 *   get:
 *     summary: Get current user's watch history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Watch history fetched successfully
 */
router.route("/history").get(verifyJWT, getWatchHistory);

export default router;