import { Router } from "express";
import {
  toggleSubscription,
  getChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// all subscription routes need login

router.use(verifyJWT); 

 // subscribe/unsubscribe
router.route("/c/:channelId").post(toggleSubscription);         
// get subscribers
router.route("/c/:channelId/subscribers").get(getChannelSubscribers); 
// get my subscriptions
router.route("/my-subscriptions").get(getSubscribedChannels);    


export default router;