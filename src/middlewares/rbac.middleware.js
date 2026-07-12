import { ApiError } from "../utils/ApiError.js";

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized request");
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Role "${req.user.role}" is not allowed to access this route`
        )
      );
    }

    next();
  };
};

export { authorizeRoles };