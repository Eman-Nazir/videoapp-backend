
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
// like/unlike video
router.route("/toggle/v/:videoId").post(toggleVideoLike);    
// like/unlike comment   
router.route("/toggle/c/:commentId").post(toggleCommentLike);
 // get total likes on video   
router.route("/video/:videoId").get(getVideoLikes);    
// get all liked videos        
router.route("/videos").get(getLikedVideos);                    

export default router;