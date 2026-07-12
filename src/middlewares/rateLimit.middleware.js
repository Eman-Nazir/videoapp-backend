import rateLimit from "express-rate-limit";

// General limiter all routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,   
  // max: 50,     // for testing purpose                
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    message: "Too many requests, please try again after 15 minutes",
  },
});

// Strict limiter  login & register only
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,   
  //  max: 3,     // for testing purpose                 
  standardHeaders: true,
  
  legacyHeaders: false,
  message: {
    statusCode: 429,
    message: "Too many attempts, please try again after 15 minutes",
  },
});