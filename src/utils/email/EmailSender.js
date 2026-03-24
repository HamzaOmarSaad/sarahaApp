import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({
  to,
  cc,
  subject,
  html,
  attachments = [],
  text,
}) => {
  const info = await transporter.sendMail({
    from: `"saraha app " <${process.env.EMAIL}>`,
    to,
    cc,
    subject,
    html,
    text,
    attachments,
  });
  return info;
};
