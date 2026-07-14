import { Router } from "express";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";

const router = Router();

router.use(verifyJWT);

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Video comment system
 */

/**
 * @swagger
 * /comments/{videoId}:
 *   get:
 *     summary: Get all comments for a video (paginated)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comments fetched successfully
 *   post:
 *     summary: Add a comment to a video
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 example: Great video!
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Comment content is required
 */
router
  .route("/:videoId")
  .get(getVideoComments)
  .post(authorizeRoles("user", "creator", "admin"), addComment);

/**
 * @swagger
 * /comments/c/{commentId}:
 *   patch:
 *     summary: Update your own comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       403:
 *         description: Not authorized to update this comment
 *   delete:
 *     summary: Delete a comment (owner or admin)
 *     tags: [Comments]
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
 *         description: Comment deleted successfully
 *       403:
 *         description: Not authorized to delete this comment
 */
router
  .route("/c/:commentId")
  .patch(authorizeRoles("user", "creator", "admin"), updateComment)
  .delete(authorizeRoles("user", "creator", "admin"), deleteComment);

export default router;