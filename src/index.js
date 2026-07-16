import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
// import { startCronJobs } from "./jobs/cleanupJob.js";
import logger from "./utils/logger.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server is running at port: ${PORT}`);
      // startCronJobs();
    });
  })
  .catch((err) => {
    logger.error("MongoDB connection failed:", err);
  });