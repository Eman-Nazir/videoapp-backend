import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import { app } from "../../app.js";
import mongoose from "mongoose";

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("Auth Routes", () => {

  describe("POST /api/v1/users/login", () => {

    //  use real email + real password from your DB
    it("should login successfully with correct credentials", async () => {
      const response = await request(app)
        .post("/api/v1/users/login")
        .send({
          email: "eman406261@gmail.com",  //  real email in DB 
          password: "eman123",             //  real password 
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
      expect(response.body.message).toBe("User logged In Successfully");
    });

    //  real email + wrong password → should fail
    it("should fail with wrong password", async () => {
      const response = await request(app)
        .post("/api/v1/users/login")
        .send({
          email: "eman406261@gmail.com",  //  real email  that exist in db 
          password: "wrongpassword123",    //  wrong password intentionally
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    //  fake email → should fail with 404
    it("should fail with non-existent email", async () => {
      const response = await request(app)
        .post("/api/v1/users/login")
        .send({
          email: "notexist@gmail.com",  //  fake email 
          password: "somepassword",
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    //  no email → should fail with 400
    it("should fail without email", async () => {
      const response = await request(app)
        .post("/api/v1/users/login")
        .send({
          password: "somepassword",  //  no email 
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

  });

  describe("GET /api/v1/users/current-user", () => {

    //  no token → should fail
    it("should fail without token", async () => {
      const response = await request(app)
        .get("/api/v1/users/current-user");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    //  invalid token → should fail
    it("should fail with invalid token", async () => {
      const response = await request(app)
        .get("/api/v1/users/current-user")
        .set("Authorization", "Bearer invalidtoken123");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

  });

});