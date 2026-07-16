import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import logger from "../utils/logger.js";



// GET ALL COMMENTS FOR A VIDEO
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const pipeline = [
    // get comments for this video only
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    // get owner details
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$ownerDetails" },
    // newest comments first
    {
      $sort: { createdAt: -1 },
    },
  ];

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const comments = await Comment.aggregatePaginate(
    Comment.aggregate(pipeline),
    options
  );

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

// ADD COMMENT
const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  // check video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

logger.info(`Comment added on video: ${videoId} by user: ${req.user._id}`); 

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"));
});



// DELETE COMMENT
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // who can delete:
  // 1. comment owner (any role)
  // 2. video owner / creator
  // 3. admin
  const isOwner = comment.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  await Comment.findByIdAndDelete(commentId);
  logger.warn(`Comment deleted: ${commentId} by user: ${req.user._id}`); 
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});
// UPDATE COMMENT
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: { content },
    },
    {
      new: true,
    }
  );

  if (!updatedComment) {
    throw new ApiError(404, "Comment not found");
  }

  logger.info(
    `Comment updated: ${commentId} by user: ${req.user._id}`
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedComment,
        "Comment updated successfully"
      )
    );
});
export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
};