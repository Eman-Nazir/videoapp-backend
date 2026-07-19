import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import { apiLimiter } from "./middlewares/rateLimit.middleware.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";
import logger from "./utils/logger.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import emailRouter from "./routes/email.routes.js";

const app = express();

// Security middleware
app.use(helmet());

app.use(
  compression({
    level: 6,
    threshold: 0,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

// Rate Limiting
app.use("/api", apiLimiter);

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Request Logger
app.use(requestLogger);

// Test Compression Route
app.get("/test-compression", (req, res) => {
  console.log("test route hit!");
  const data = { message: "test ".repeat(500) };
  res.json(data);
});

// API Root Route
app.get("/api/v1", (req, res) => {
  res.status(200).json({
    success: true,
    message: " Welcome to the VideoApp Backend API",
    version: "v1",
    documentation: `${req.protocol}://${req.get("host")}/api-docs`,
    endpoints: {
      users: "/api/v1/users",
      videos: "/api/v1/videos",
      comments: "/api/v1/comments",
      likes: "/api/v1/likes",
      subscriptions: "/api/v1/subscriptions",
      payment: "/api/v1/payment",
      email: "/api/v1/email",
    },
  });
});

// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "VideoApp API Docs",
    customCss: ".swagger-ui .topbar { display: none }",
  })
);

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/email", emailRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error(`${req.method} ${req.originalUrl} - ${message}`, {
    stack: err.stack,
  });

  return res.status(statusCode).json({
    statusCode,
    message,
    success: false,
  });
});

export { app };