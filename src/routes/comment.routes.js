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

router.use(verifyJWT); // all comment routes need login

router
  .route("/:videoId")
  .get(getVideoComments)   // any logged in user can view comments
  .post(
    authorizeRoles("user", "creator", "admin"), // all roles can comment
    addComment
  );

router
  .route("/c/:commentId")
  .patch(
    authorizeRoles("user", "creator", "admin"), // owner can edit own comment
    updateComment
  )
  .delete(
    authorizeRoles("user", "creator", "admin"), // owner or admin can delete
    deleteComment
  );

export default router;