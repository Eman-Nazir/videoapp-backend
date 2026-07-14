import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import { apiLimiter } from "./middlewares/rateLimit.middleware.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

//  ALL route imports at top
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import emailRouter from "./routes/email.routes.js";

const app = express();

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

app.use("/api", apiLimiter);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//  test route
app.get("/test-compression", (req, res) => {
  console.log("test route hit!");
  const data = { message: "test ".repeat(500) };
  res.json(data);
});

//  Swagger route 
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "VideoApp API Docs",
    customCss: ".swagger-ui .topbar { display: none }",
  })
);

// routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/email", emailRouter);

//  global error handler — ALWAYS LAST
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    statusCode,
    message,
    success: false,
  });
});

export { app };
