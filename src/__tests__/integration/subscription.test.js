import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import { app } from "../../app.js";
import mongoose from "mongoose";

let token = "";
const channelId = "6a3ba11263ba85b6fef1b7fc"; 

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

describe("Subscription Routes", () => {

  // TOGGLE SUBSCRIPTION
  describe("POST /api/v1/subscriptions/c/:channelId", () => {

    it("should subscribe to a channel successfully", async () => {
      const response = await request(app)
        .post(`/api/v1/subscriptions/c/${channelId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("isSubscribed");
    });

    it("should unsubscribe on second toggle", async () => {
      const response = await request(app)
        .post(`/api/v1/subscriptions/c/${channelId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("isSubscribed");
    });

    it("should fail without token", async () => {
      const response = await request(app)
        .post(`/api/v1/subscriptions/c/${channelId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail subscribing to yourself", async () => {
      const myUserId = "6a44ca55d4b7cf73eb852c7e"; 
      const response = await request(app)
        .post(`/api/v1/subscriptions/c/${myUserId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("You cannot subscribe to yourself");
    });

  });

  // GET CHANNEL SUBSCRIBERS
  describe("GET /api/v1/subscriptions/c/:channelId/subscribers", () => {

    it("should get channel subscribers", async () => {
      const response = await request(app)
        .get(`/api/v1/subscriptions/c/${channelId}/subscribers`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("totalSubscribers");
      expect(response.body.data).toHaveProperty("subscribers");
    });

    it("should fail without token", async () => {
      const response = await request(app)
        .get(`/api/v1/subscriptions/c/${channelId}/subscribers`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

  });

  // GET MY SUBSCRIPTIONS
  describe("GET /api/v1/subscriptions/my-subscriptions", () => {

    it("should get my subscribed channels", async () => {
      const response = await request(app)
        .get("/api/v1/subscriptions/my-subscriptions")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("totalSubscribedChannels");
      expect(response.body.data).toHaveProperty("subscribedChannels");
    });

    it("should fail without token", async () => {
      const response = await request(app)
        .get("/api/v1/subscriptions/my-subscriptions");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

  });

});