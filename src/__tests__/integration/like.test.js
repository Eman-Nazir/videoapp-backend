import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import { app } from "../../app.js";
import mongoose from "mongoose";

let token = "";
const videoId = "6a4a6d8f51357c82bfeebb42"; 
const commentId = "6a3ba954acc1c0f78d031422";

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const response = await request(app)
    .post("/api/v1/users/login")
    .send({
      email: "eman406261@gmail.com",
      password: "eman123",
    });

  token = response.body.data?.accessToken;
},40000);

afterAll(async () => {
  await mongoose.disconnect();
});

describe("Like Routes", () => {

  
  // TOGGLE VIDEO LIKE
  
  describe("POST /api/v1/likes/toggle/v/:videoId", () => {

    it("should like a video successfully", async () => {
      const response = await request(app)
        .post(`/api/v1/likes/toggle/v/${videoId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("isLiked");
    });

    it("should unlike a video on second toggle", async () => {
      const response = await request(app)
        .post(`/api/v1/likes/toggle/v/${videoId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("isLiked");
    });

    it("should fail without token", async () => {
      const response = await request(app)
        .post(`/api/v1/likes/toggle/v/${videoId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

  });

  
  // TOGGLE COMMENT LIKE
  
  describe("POST /api/v1/likes/toggle/c/:commentId", () => {

    it("should like a comment successfully", async () => {
      const response = await request(app)
        .post(`/api/v1/likes/toggle/c/${commentId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("isLiked");
    });

    it("should fail without token", async () => {
      const response = await request(app)
        .post(`/api/v1/likes/toggle/c/${commentId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

  });

  
  // GET VIDEO LIKES
  
  describe("GET /api/v1/likes/video/:videoId", () => {

    it("should get total likes for a video", async () => {
      const response = await request(app)
        .get(`/api/v1/likes/video/${videoId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("totalLikes");
      expect(response.body.data).toHaveProperty("isLiked");
    });

    it("should fail without token", async () => {
      const response = await request(app)
        .get(`/api/v1/likes/video/${videoId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

  });

  
  // GET LIKED VIDEOS
  
  describe("GET /api/v1/likes/videos", () => {

    it("should get all liked videos", async () => {
      const response = await request(app)
        .get("/api/v1/likes/videos")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should fail without token", async () => {
      const response = await request(app)
        .get("/api/v1/likes/videos");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

  });

});