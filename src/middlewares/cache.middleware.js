import redis from "../utils/redis.js";

const cacheMiddleware = (expirySeconds = 3600) => {
  return async (req, res, next) => {
    try {
      const cacheKey = `cache:${req.originalUrl}`;
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        console.log("Cache hit:", cacheKey);

        // ✅ set header BEFORE sending
        // let compression handle the response
        res.setHeader("Content-Type", "application/json");

        return res.status(200).json({
          statusCode: 200,
          data: cachedData,
          message: "Data fetched from cache",
          success: true,
          fromCache: true,
        });
      }

      console.log("Cache miss:", cacheKey);
      const originalJson = res.json.bind(res);

      res.json = async (body) => {
        if (body.success) {
          await redis.setex(cacheKey, expirySeconds, body.data);
          console.log("Cached:", cacheKey, "for", expirySeconds, "seconds");
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.log("Cache error:", error.message);
      next();
    }
  };
};

const clearCache = async (pattern) => {
  try {
    const keys = await redis.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log("Cache cleared for:", pattern);
    }
  } catch (error) {
    console.log("Cache clear error:", error.message);
  }
};

export { cacheMiddleware, clearCache };