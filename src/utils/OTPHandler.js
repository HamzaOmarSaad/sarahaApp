import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";

export const generateOTP = () => {
  return otpGenerator.generate(6, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (to, otp) => {
  await transporter.sendMail({
    from: `"App Verification" <${process.env.EMAIL}>`,
    to,
    subject: "Email Verification OTP",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });
};
