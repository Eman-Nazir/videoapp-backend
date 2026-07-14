import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "VideoApp Backend API",
      version: "1.0.0",
      description:
        "A production-level REST API for a YouTube-like video platform. Handles authentication, video management, comments, likes, subscriptions, payments, caching, and background automation.",
      contact: {
        name: "Eman Nazir",
        email: "eman406261@gmail.com",
      },
    },
    servers: [
      {
        url: "https://videoapp-backend-production-a823.up.railway.app/api/v1",
        description: "Production server",
      },
      {
        url: "http://localhost:3000/api/v1",
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            username: { type: "string" },
            fullName: { type: "string" },
            email: { type: "string" },
            avatar: { type: "string" },
            coverImage: { type: "string" },
            role: { type: "string", enum: ["user", "creator", "admin"] },
          },
        },
        Video: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            videoFile: { type: "string" },
            thumbnail: { type: "string" },
            duration: { type: "number" },
            views: { type: "number" },
            isPublished: { type: "boolean" },
          },
        },
        Comment: {
          type: "object",
          properties: {
            _id: { type: "string" },
            content: { type: "string" },
            video: { type: "string" },
            owner: { type: "string" },
          },
        },
        Error: {
          type: "object",
          properties: {
            statusCode: { type: "number" },
            message: { type: "string" },
            success: { type: "boolean", example: false },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;