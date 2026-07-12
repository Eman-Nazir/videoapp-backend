import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);


videoSchema.index({ owner: 1 });           
videoSchema.index({ isPublished: 1 });     
videoSchema.index({ views: -1 });          
videoSchema.index({ createdAt: -1 });      

// compound indexes — multiple fields together
videoSchema.index({ owner: 1, isPublished: 1 });      
videoSchema.index({ isPublished: 1, createdAt: -1 }); 
videoSchema.index({ isPublished: 1, views: -1 });     

// text index for search
videoSchema.index({ title: "text", description: "text" });

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);