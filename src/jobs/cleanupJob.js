import cron from "node-cron";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

const extractPublicId = (cloudinaryUrl) => {
  const parts = cloudinaryUrl.split("/");
  const filename = parts[parts.length - 1].split(".")[0];
  const folder = parts[parts.length - 2];
  return folder.startsWith("v") ? filename : `${folder}/${filename}`;
};

// JOB 1 - clean expired OTPs
const cleanupExpiredOTPs = async () => {
  try {
    const result = await User.updateMany(
      {
        otpExpiry: { $lt: new Date() },
        otp: { $ne: null },
      },
      {
        $set: {
          otp: null,
          otpExpiry: null,
        },
      }
    );
    console.log("OTP cleanup done. Count:", result.modifiedCount);
  } catch (error) {
    console.log("OTP cleanup error:", error.message);
  }
};

// JOB 2 - clean expired password reset tokens
const cleanupExpiredResetTokens = async () => {
  try {
    const result = await User.updateMany(
      {
        passwordResetExpiry: { $lt: new Date() },
        passwordResetToken: { $ne: null },
      },
      {
        $set: {
          passwordResetToken: null,
          passwordResetExpiry: null,
        },
      }
    );
    console.log("Reset token cleanup done. Count:", result.modifiedCount);
  } catch (error) {
    console.log("Reset token cleanup error:", error.message);
  }
};

// JOB 3 - permanently delete soft deleted videos after 30 days
const cleanupTrashedVideos = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const trashedVideos = await Video.find({
      isDeleted: true,
      deletedAt: { $lt: thirtyDaysAgo },
    });

    for (const video of trashedVideos) {
      await deleteFromCloudinary(extractPublicId(video.videoFile));
      await deleteFromCloudinary(extractPublicId(video.thumbnail));
      await Video.findByIdAndDelete(video._id);
    }

    console.log("Trash cleanup done. Count:", trashedVideos.length);
  } catch (error) {
    console.log("Trash cleanup error:", error.message);
  }
};

// JOB 4 - auto logout users inactive for 30 days
const expireInactiveSessions = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await User.updateMany(
      {
        updatedAt: { $lt: thirtyDaysAgo },
        refreshToken: { $ne: null },
      },
      {
        $set: {
          refreshToken: null,
        },
      }
    );
    console.log("Session expiry done. Count:", result.modifiedCount);
  } catch (error) {
    console.log("Session expiry error:", error.message);
  }
};

// JOB 5 - find inactive users for re-engagement
const findInactiveUsers = async () => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const inactiveUsers = await User.find({
      updatedAt: { $lt: sevenDaysAgo },
    }).select("email username");

    console.log("Inactive users found. Count:", inactiveUsers.length);
  } catch (error) {
    console.log("Inactive users check error:", error.message);
  }
};

// START ALL CRON JOBS
const startCronJobs = () => {

  // TESTING - runs every minute
  // change to production schedule after testing
  cron.schedule("* * * * *", async () => {
    console.log("------- Cron job started -------");
    await cleanupExpiredOTPs();
    await cleanupExpiredResetTokens();
    await cleanupTrashedVideos();
    await expireInactiveSessions();
    await findInactiveUsers();
    console.log("------- Cron job finished -------");
  });

  // PRODUCTION SCHEDULE - uncomment after testing is done
  // every hour - OTP and reset token cleanup
  // cron.schedule("0 * * * *", async () => {
  //   await cleanupExpiredOTPs();
  //   await cleanupExpiredResetTokens();
  // });

  // every day at midnight - trash cleanup and session expiry
  // cron.schedule("0 0 * * *", async () => {
  //   await cleanupTrashedVideos();
  //   await expireInactiveSessions();
  // });

  // every sunday at midnight - re-engagement check
  // cron.schedule("0 0 * * 0", async () => {
  //   await findInactiveUsers();
  // });

  console.log("Cron jobs started - running every minute for testing");
};

export { startCronJobs };