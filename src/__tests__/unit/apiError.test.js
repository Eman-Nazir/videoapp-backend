import { describe, it, expect } from "@jest/globals";
import { ApiError } from "../../utils/ApiError.js";

describe("ApiError Class", () => {

  it("should create error with correct statusCode", () => {
    const error = new ApiError(404, "Not found");
    expect(error.statusCode).toBe(404);
  });

  it("should create error with correct message", () => {
    const error = new ApiError(400, "Bad request");
    expect(error.message).toBe("Bad request");
  });

  it("should set success to false", () => {
    const error = new ApiError(500, "Server error");
    expect(error.success).toBe(false);
  });

  it("should be instance of Error", () => {
    const error = new ApiError(400, "Bad request");
    expect(error).toBeInstanceOf(Error);
  });

  it("should handle 401 unauthorized", () => {
    const error = new ApiError(401, "Unauthorized");
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe("Unauthorized");
  });

  it("should handle 403 forbidden", () => {
    const error = new ApiError(403, "Forbidden");
    expect(error.statusCode).toBe(403);
  });

});