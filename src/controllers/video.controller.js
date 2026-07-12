import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { clearCache } from "../middlewares/cache.middleware.js";

// extract publicId from cloudinary url
const extractPublicId = (cloudinaryUrl) => {
  const parts = cloudinaryUrl.split("/");
  const filename = parts[parts.length - 1].split(".")[0];
  const folder = parts[parts.length - 2];
  return folder.startsWith("v") ? filename : `${folder}/${filename}`;
};


// GET ALL VIDEOS 
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
    minDuration,
    maxDuration,
    minViews,
  } = req.query;

  const pipeline = [];

  const matchConditions = {
    isPublished: true,  
    isDeleted: false,   
  };

  if (userId) {
    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid userId");
    matchConditions.owner = new mongoose.Types.ObjectId(userId);
  }

  if (minDuration || maxDuration) {
    matchConditions.duration = {};
    if (minDuration) matchConditions.duration.$gte = Number(minDuration);
    if (maxDuration) matchConditions.duration.$lte = Number(maxDuration);
  }

  if (minViews) {
    matchConditions.views = { $gte: Number(minViews) };
  }

  if (query) {
    matchConditions.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  pipeline.push({ $match: matchConditions });

  // sort
  pipeline.push({
    $sort: { [sortBy]: sortType === "asc" ? 1 : -1 },
  });

  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: { username: 1, avatar: 1 },
          },
        ],
      },
    },
    { $unwind: "$ownerDetails" }
  );

  pipeline.push({
    $project: {
      title: 1,
      description: 1,
      thumbnail: 1,
      duration: 1,
      views: 1,
      isPublished: 1,
      createdAt: 1,
      ownerDetails: 1,
    },
  });

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const videos = await Video.aggregatePaginate(
    Video.aggregate(pipeline),
    options
  );

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});


// PUBLISH A VIDEO

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath) throw new ApiError(400, "Video file is required");
  if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail is required");

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile?.url) throw new ApiError(500, "Video upload failed");
  if (!thumbnail?.url) throw new ApiError(500, "Thumbnail upload failed");

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: videoFile.duration,
    owner: req.user._id,
    isPublished: true,
  });

  await clearCache("/api/v1/videos*");

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});


// GET VIDEO BY ID 

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid videoId");

  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  ).populate("owner", "username avatar"); 

  if (!video) throw new ApiError(404, "Video not found");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});


// UPDATE VIDEO

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid videoId");

  const video = await Video.findById(videoId).select(
    "owner thumbnail title description"
  );
  if (!video) throw new ApiError(404, "Video not found");

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  let thumbnailUrl = video.thumbnail;
  if (req.file?.path) {
    await deleteFromCloudinary(extractPublicId(video.thumbnail));
    const newThumbnail = await uploadOnCloudinary(req.file.path);
    if (!newThumbnail?.url) throw new ApiError(500, "Thumbnail upload failed");
    thumbnailUrl = newThumbnail.url;
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title || video.title,
        description: description || video.description,
        thumbnail: thumbnailUrl,
      },
    },
    { new: true }
  );

  await clearCache("/api/v1/videos*");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});


// DELETE VIDEO

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid videoId");

  const video = await Video.findById(videoId).select(
    "owner videoFile thumbnail"
  );
  if (!video) throw new ApiError(404, "Video not found");

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  await deleteFromCloudinary(extractPublicId(video.videoFile));
  await deleteFromCloudinary(extractPublicId(video.thumbnail));
  await Video.findByIdAndDelete(videoId);

  // clear cache after delete
  await clearCache("/api/v1/videos*");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});


// TOGGLE PUBLISH STATUS

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid videoId");

  const video = await Video.findById(videoId).select("owner isPublished");
  if (!video) throw new ApiError(404, "Video not found");

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized request");
  }

  const updated = await Video.findByIdAndUpdate(
    videoId,
    { $set: { isPublished: !video.isPublished } },
    { new: true }
  );

  await clearCache("/api/v1/videos*");

  return res.status(200).json(
    new ApiResponse(
      200,
      { isPublished: updated.isPublished },
      `Video ${updated.isPublished ? "published" : "unpublished"} successfully`
    )
  );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};