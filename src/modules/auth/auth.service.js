import UserModel from "../../DB/models/userModel.js";
import { createDoc, findOneDoc } from "../../DB/repos/repo.js";
import { compareHash, generateHash } from "../../utils/Hashing.security.js";
import { errorHandle } from "../../utils/resHandler.js";

export const signupService = async ({ username, password, email, gender }) => {
  const isEmail = await findOneDoc({
    filter: { email },
    model: UserModel,
    select: "email",
  });
  if (isEmail) {
    throw errorHandle({ message: "email alredy exist", status: 400 });
  }
  const hashedPass = await generateHash({ text: password });
  const data = {
    username,
    email,
    gender,
    password: hashedPass,
  };
  const user = await createDoc({ model: UserModel, data });
  return user;
};

export const loginService = async (email, password) => {
  const isUser = await findOneDoc({
    filter: { email },
    model: UserModel,
    select: "email password username",
  });
  if (!isUser) {
    throw errorHandle({ message: "wrong credantials", status: 402 });
  }
  const match = await compareHash(password, isUser.password);
  if (!match) {
    throw errorHandle({ message: "wrong credantials", status: 402 });
  }
  return isUser;
};
export const sendOtpService = async (email) => {
  const otp = generateOTP();

  await UserModel.updateOne(
    { email },
    {
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000,
    },
  );

  await sendOTPEmail(email, otp);
};
export const verifyOTPService = async (email, otp) => {
  const user = await findOneDoc({ filter: { email }, model: UserModel });

  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

  if (user.otpExpires < Date.now())
    return res.status(400).json({ message: "OTP expired" });

  user.isEmailConfirmend = true;
  user.otp = null;
  user.otpExpires = null;

  await user.save();
};
