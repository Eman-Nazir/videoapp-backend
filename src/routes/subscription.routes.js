import { Router } from "express";
import {
  toggleSubscription,
  getChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Channel subscription system
 */

/**
 * @swagger
 * /subscriptions/c/{channelId}:
 *   post:
 *     summary: Subscribe or unsubscribe to a channel
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription toggled successfully
 *       400:
 *         description: Cannot subscribe to yourself
 */
router.route("/c/:channelId").post(toggleSubscription);

/**
 * @swagger
 * /subscriptions/c/{channelId}/subscribers:
 *   get:
 *     summary: Get all subscribers of a channel
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscribers fetched successfully
 */
router.route("/c/:channelId/subscribers").get(getChannelSubscribers);

/**
 * @swagger
 * /subscriptions/my-subscriptions:
 *   get:
 *     summary: Get channels the current user has subscribed to
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscribed channels fetched successfully
 */
router.route("/my-subscriptions").get(getSubscribedChannels);

export default router;