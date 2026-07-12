import { describe, it, expect } from "@jest/globals";
import { ApiResponse } from "../../utils/ApiResponse.js";

describe("ApiResponse Class", () => {

  it("should create response with correct statusCode", () => {
    const response = new ApiResponse(200, {}, "Success");
    expect(response.statusCode).toBe(200);
  });

  it("should create response with correct message", () => {
    const response = new ApiResponse(200, {}, "User fetched successfully");
    expect(response.message).toBe("User fetched successfully");
  });

  it("should set success true for 2xx status codes", () => {
    const response = new ApiResponse(200, {}, "Success");
    expect(response.success).toBe(true);
  });

  it("should set success false for 4xx status codes", () => {
    const response = new ApiResponse(400, {}, "Bad Request");
    expect(response.success).toBe(false);
  });

  it("should include data in response", () => {
    const data = { user: "eman", role: "admin" };
    const response = new ApiResponse(200, data, "Success");
    expect(response.data).toEqual(data);
  });

  it("should handle empty data", () => {
    const response = new ApiResponse(200, {}, "Deleted successfully");
    expect(response.data).toEqual({});
  });

});