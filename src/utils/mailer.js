import nodemailer from "nodemailer";

// create transporter — gmail connection
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// SEND WELCOME EMAIL
const sendWelcomeEmail = async (email, username) => {
  const mailOptions = {
    from: `"VideoApp" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to VideoApp! ",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff0000;">Welcome to VideoApp! </h2>
        <p>Hi <strong>${username}</strong>,</p>
        <p>Your account has been created successfully.</p>
        <p>Start uploading and watching videos today!</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>VideoApp Team</strong></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// SEND OTP EMAIL
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"VideoApp" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff0000;">OTP Verification</h2>
        <p>Your one-time password is:</p>
        <h1 style="
          background: #f4f4f4;
          padding: 20px;
          text-align: center;
          letter-spacing: 10px;
          font-size: 40px;
          color: #333;
        ">${otp}</h1>
        <p>This OTP expires in <strong>10 minutes</strong>.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br/>
        <p><strong>VideoApp Team</strong></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// SEND PASSWORD RESET EMAIL
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"VideoApp" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff0000;">Password Reset</h2>
        <p>You requested to reset your password.</p>
        <p>Click the button below to reset it:</p>
        <a href="${resetUrl}" style="
          display: inline-block;
          background: #ff0000;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        ">Reset Password</a>
        <p>This link expires in <strong>1 hour</strong>.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br/>
        <p><strong>VideoApp Team</strong></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export { sendWelcomeEmail, sendOTPEmail, sendPasswordResetEmail };