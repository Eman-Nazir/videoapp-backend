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

describe("Email Routes", () => {

  // SEND OTP
  describe("POST /api/v1/email/send-otp", () => {

    it("should send OTP successfully", async () => {
      const response = await request(app)
        .post("/api/v1/email/send-otp")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("OTP sent to your email successfully");
    });

    it("should fail without token", async () => {
      const response = await request(app)
        .post("/api/v1/email/send-otp");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

  });

  // VERIFY OTP
  describe("POST /api/v1/email/verify-otp", () => {

    it("should fail with wrong OTP", async () => {
      const response = await request(app)
        .post("/api/v1/email/verify-otp")
        .set("Authorization", `Bearer ${token}`)
        .send({ otp: "000000" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid OTP");
    });

    it("should fail without OTP", async () => {
      const response = await request(app)
        .post("/api/v1/email/verify-otp")
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail without token", async () => {
      const response = await request(app)
        .post("/api/v1/email/verify-otp")
        .send({ otp: "123456" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

  });

  // FORGOT PASSWORD
  describe("POST /api/v1/email/forgot-password", () => {

    it("should send reset email successfully", async () => {
      const response = await request(app)
        .post("/api/v1/email/forgot-password")
        .send({ email: "eman406261@gmail.com" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Password reset link sent to your email");
    },15000);

    it("should fail with non-existent email", async () => {
      const response = await request(app)
        .post("/api/v1/email/forgot-password")
        .send({ email: "notexist@gmail.com" });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it("should fail without email", async () => {
      const response = await request(app)
        .post("/api/v1/email/forgot-password")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

  });

  // RESET PASSWORD
  describe("POST /api/v1/email/reset-password", () => {

    it("should fail with invalid token", async () => {
      const response = await request(app)
        .post("/api/v1/email/reset-password")
        .send({
          token: "invalidtoken123",
          newPassword: "newpass123",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid or expired reset token");
    });

    it("should fail without token", async () => {
      const response = await request(app)
        .post("/api/v1/email/reset-password")
        .send({ newPassword: "newpass123" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail without new password", async () => {
      const response = await request(app)
        .post("/api/v1/email/reset-password")
        .send({ token: "sometoken123" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

  });

});