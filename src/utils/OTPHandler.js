import otpGenerator from "otp-generator";
import { sendEmail } from "./email/EmailSender";
import resolve from "path";
import { email_template } from "./email/email.template";
import {
  deleteValue,
  getValue,
  keyPrefixGenrator,
  otpkeyGenerator,
  setValue,
} from "../DB/repos/redis.repo";
import UserModel from "../DB/models/userModel";
import { compareHash } from "../security/Hashing.security";
import { errorHandle } from "./resHandler";

export const otpkeyGenerator = ({ email, type }) => {
  return `OTP:${type}:${email}`;
};
export const generateOTP = () => {
  return Math.floor(Math.random() * 900000 + 100000);
};
export const sendOTPEmail = async (to, otp) => {
  await sendEmail({
    to: to,
    subject: "Email Verification OTP",
    html: email_template(
      `Your OTP is ${otp}. It expires in 5 minutes.`,
      "Email Verification OTP",
    ),
    // attachments: [
    //   {
    //     path: resolve("./data.txt"),
    //     filename: "dummy_name.txt",
    //     contentType: "plain/text",
    //   },
    //  ],
  });
};

export const sendOtp = async (email, type) => {
  const otp = generateOTP();

  const hashedOTP = await generateHash({ text: `${otp}` });

  await setValue({
    key: otpkeyGenerator({ email, type }),
    value: hashedOTP,
    ttl: 300,
  });

  await sendOTPEmail(email, otp);
};
export const verifyOtp = async (email, otp, type) => {
  const key = otpkeyGenerator({ email, type });

  const hashed = await getValue({ key });

  if (!hashed) {
    throw errorHandle({ message: "OTP expired", status: 400 });
  }

  const match = await compareHash({ text: otp, hashed });

  if (!match) {
    throw errorHandle({ message: "invalid otp", status: 400 });
  }

  await deleteValue({ key });

  return true;
};
// export const thirdPartygenerateOTP = () => {
//   return otpGenerator.generate(6, {
//     digits: true,
//     alphabets: false,
//     upperCase: false,
//     specialChars: false,
//   });
// };
