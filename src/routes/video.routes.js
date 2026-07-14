import { Router } from "express";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { cacheMiddleware } from "../middlewares/cache.middleware.js";

const router = Router();

router.use(verifyJWT);

/**
 * @swagger
 * tags:
 *   name: Videos
 *   description: Video upload, management, search, and filtering
 */

/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Get all videos with pagination, search, filter, and sort
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search keyword for title/description
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortType
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: minViews
 *         schema:
 *           type: integer
 *       - in: query
 *         name: minDuration
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxDuration
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Videos fetched successfully
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Publish a new video (creator/admin only)
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, videoFile, thumbnail]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               videoFile:
 *                 type: string
 *                 format: binary
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Video published successfully
 *       403:
 *         description: Not authorized - creator or admin role required
 */
router
  .route("/")
  .get(cacheMiddleware(3600), getAllVideos)
  .post(
    authorizeRoles("creator", "admin"),
    upload.fields([
      { name: "videoFile", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    publishAVideo
  );

/**
 * @swagger
 * /videos/{videoId}:
 *   get:
 *     summary: Get a single video by ID (increments view count)
 *     tags: [Videos]
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
 *         description: Video fetched successfully
 *       400:
 *         description: Invalid videoId
 *       404:
 *         description: Video not found
 *   patch:
 *     summary: Update video title, description, or thumbnail (owner only)
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Video updated successfully
 *       403:
 *         description: Not authorized to update this video
 *   delete:
 *     summary: Delete a video (admin only)
 *     tags: [Videos]
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
 *         description: Video deleted successfully
 *       403:
 *         description: Not authorized to delete this video
 */
router
  .route("/:videoId")
  .get(cacheMiddleware(3600), getVideoById)
  .patch(authorizeRoles("creator", "admin"), upload.single("thumbnail"), updateVideo)
  .delete(authorizeRoles("admin"), deleteVideo);

/**
 * @swagger
 * /videos/toggle/publish/{videoId}:
 *   patch:
 *     summary: Toggle publish/unpublish status of a video
 *     tags: [Videos]
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
 *         description: Publish status toggled successfully
 */
router
  .route("/toggle/publish/:videoId")
  .patch(authorizeRoles("creator", "admin"), togglePublishStatus);

export default router;