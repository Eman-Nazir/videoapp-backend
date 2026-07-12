import Stripe from "stripe";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// CREATE CHECKOUT SESSION

const createCheckoutSession = asyncHandler(async (req, res) => {
  const { planName, amount } = req.body;

  if (!planName || !amount) {
    throw new ApiError(400, "Plan name and amount are required");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: planName,
            description: `VideoApp ${planName} subscription`,
          },
          unit_amount: amount * 100, 
        },
        quantity: 1,
      },
    ],
    // where to redirect after payment
    success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
    metadata: {
      userId: req.user._id.toString(),
      planName,
    },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        sessionId: session.id,
        sessionUrl: session.url, // redirect user to this URL
      },
      "Checkout session created successfully"
    )
  );
});


// GET SESSION DETAILS

const getSessionDetails = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    throw new ApiError(400, "Session ID is required");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        sessionId: session.id,
        status: session.payment_status,  // paid / unpaid
        amount: session.amount_total / 100, // convert cents to dollars
        currency: session.currency,
        customerEmail: session.customer_details?.email,
        planName: session.metadata?.planName,
      },
      "Session details fetched successfully"
    )
  );
});





export { createCheckoutSession, getSessionDetails };