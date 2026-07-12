import { Router } from "express";
import {
  createCheckoutSession,
  getSessionDetails,
  
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import express from "express";

const router = Router();


// protected routes — need login
router.use(verifyJWT);

router.post("/create-checkout", createCheckoutSession); // create payment session
router.get("/session/:sessionId", getSessionDetails);   // get session details

export default router;