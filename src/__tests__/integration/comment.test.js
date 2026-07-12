import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import { app } from "../../app.js";
import mongoose from "mongoose";

let token = "";
let commentId = "";
const videoId = "6a3cee18c24f7d5d78b18e63"; 

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

describe("Comment Routes", () => {


  // ADD COMMENT

  describe("POST /api/v1/comments/:videoId", () => {

    it("should add comment successfully", async () => {
      const response = await request(app)
        .post(`/api/v1/comments/${videoId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "This is a test comment" });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("content");
      expect(response.body.data.content).toBe("This is a test comment");
      expect(response.body.message).toBe("Comment added successfully");

      commentId = response.body.data._id; 
    });

    it("should fail without content", async () => {
      const response = await request(app)
        .post(`/api/v1/comments/${videoId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail without token", async () => {
      const response = await request(app)
        .post(`/api/v1/comments/${videoId}`)
        .send({ content: "Test comment" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail with invalid videoId", async () => {
      const response = await request(app)
        .post("/api/v1/comments/invalidid123")
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "Test comment" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

  });


  // GET COMMENTS

  describe("GET /api/v1/comments/:videoId", () => {

    it("should get all comments for a video", async () => {
      const response = await request(app)
        .get(`/api/v1/comments/${videoId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("docs");
    });

    it("should fail without token", async () => {
      const response = await request(app)
        .get(`/api/v1/comments/${videoId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should paginate comments", async () => {
      const response = await request(app)
        .get(`/api/v1/comments/${videoId}?page=1&limit=5`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty("docs");
      expect(response.body.data).toHaveProperty("totalDocs");
    });

  });


  // UPDATE COMMENT

  describe("PATCH /api/v1/comments/c/:commentId", () => {

    it("should update comment successfully", async () => {
      const response = await request(app)
        .patch(`/api/v1/comments/c/${commentId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "Updated test comment" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe("Updated test comment");
    });

    it("should fail with invalid commentId", async () => {
      const response = await request(app)
        .patch("/api/v1/comments/c/invalidid123")
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "Updated comment" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail without token", async () => {
      const response = await request(app)
        .patch(`/api/v1/comments/c/${commentId}`)
        .send({ content: "Updated comment" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

  });


  // DELETE COMMENT

  describe("DELETE /api/v1/comments/c/:commentId", () => {

    it("should delete comment successfully", async () => {
      const response = await request(app)
        .delete(`/api/v1/comments/c/${commentId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Comment deleted successfully");
    });

    it("should fail with invalid commentId", async () => {
      const response = await request(app)
        .delete("/api/v1/comments/c/invalidid123")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail without token", async () => {
      const response = await request(app)
        .delete(`/api/v1/comments/c/${commentId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

  });

});