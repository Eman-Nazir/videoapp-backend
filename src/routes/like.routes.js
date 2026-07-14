import { Router } from "express";
import {
  toggleVideoLike,
  toggleCommentLike,
  getVideoLikes,
  getLikedVideos,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

/**
 * @swagger
 * tags:
 *   name: Likes
 *   description: Like and unlike videos and comments
 */

/**
 * @swagger
 * /likes/toggle/v/{videoId}:
 *   post:
 *     summary: Like or unlike a video
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like toggled successfully
 */
router.route("/toggle/v/:videoId").post(toggleVideoLike);

/**
 * @swagger
 * /likes/toggle/c/{commentId}:
 *   post:
 *     summary: Like or unlike a comment
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like toggled successfully
 */
router.route("/toggle/c/:commentId").post(toggleCommentLike);

/**
 * @swagger
 * /likes/video/{videoId}:
 *   get:
 *     summary: Get total likes and like status for a video
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Likes fetched successfully
 */
router.route("/video/:videoId").get(getVideoLikes);

/**
 * @swagger
 * /likes/videos:
 *   get:
 *     summary: Get all videos liked by the current user
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liked videos fetched successfully
 */
router.route("/videos").get(getLikedVideos);

export default router;