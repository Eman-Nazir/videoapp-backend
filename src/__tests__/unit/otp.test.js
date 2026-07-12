import { describe, it, expect } from "@jest/globals";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

describe("OTP Generator", () => {

  it("should generate a 6 digit OTP", () => {
    const otp = generateOTP();
    expect(otp).toHaveLength(6);
  });

  it("should generate only numbers", () => {
    const otp = generateOTP();
    expect(otp).toMatch(/^\d+$/);
  });

  it("should generate OTP between 100000 and 999999", () => {
    const otp = Number(generateOTP());
    expect(otp).toBeGreaterThanOrEqual(100000);
    expect(otp).toBeLessThanOrEqual(999999);
  });

  it("should generate different OTPs each time", () => {
    const otp1 = generateOTP();
    const otp2 = generateOTP();
    expect(otp1).not.toBe(otp2);
  });

});