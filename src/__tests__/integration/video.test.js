import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import { app } from "../../app.js";
import mongoose from "mongoose";

let token = "";

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const response = await request(app)
    .post("/api/v1/users/login")
    .send({
      email: "eman406261@gmail.com",
      password: "eman123",      
    });

  token = response.body.data?.accessToken; 
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("Video Routes", () => {

  // GET ALL VIDEOS
  describe("GET /api/v1/videos", () => {

    it("should get all videos successfully", async () => {
      const response = await request(app)
        .get("/api/v1/videos")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("docs");
      expect(response.body.data).toHaveProperty("totalDocs");
    });

    it("should fail without token", async () => {
      const response = await request(app)
        .get("/api/v1/videos");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should filter videos by minViews", async () => {
      const response = await request(app)
        .get("/api/v1/videos?minViews=1")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.docs).toBeDefined();
    });

    it("should search videos by query", async () => {
      const response = await request(app)
        .get("/api/v1/videos?query=javascript")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should paginate videos", async () => {
      const response = await request(app)
        .get("/api/v1/videos?page=1&limit=3")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.limit).toBe(3);
      expect(response.body.data.page).toBe(1);
    });

    it("should sort videos by views descending", async () => {
      const response = await request(app)
        .get("/api/v1/videos?sortBy=views&sortType=desc")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should sort videos by oldest", async () => {
      const response = await request(app)
        .get("/api/v1/videos?sortBy=createdAt&sortType=asc")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should filter by duration range", async () => {
      const response = await request(app)
        .get("/api/v1/videos?minDuration=1&maxDuration=500")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

  });

  // GET VIDEO BY ID
  describe("GET /api/v1/videos/:videoId", () => {

    it("should fail with invalid videoId", async () => {
      const response = await request(app)
        .get("/api/v1/videos/invalidid123")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid videoId");
    });

    it("should fail with non-existent videoId", async () => {
      const response = await request(app)
        .get("/api/v1/videos/64abc123def456789012abcd")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it("should fail without token", async () => {
      const response = await request(app)
        .get("/api/v1/videos/64abc123def456789012abcd");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

  });

});