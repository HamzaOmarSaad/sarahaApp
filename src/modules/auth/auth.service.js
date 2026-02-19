import UserModel from "../../DB/models/userModel.js";
import { createDoc, findOneDoc } from "../../DB/repos/repo.js";
import { compareHash, generateHash } from "../../security/Hashing.security.js";
import { generateToken, verifyToken } from "../../security/token.security.js";
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

  const accessToken = generateToken({
    payload: { _id: decoded._id },
    options: {
      expiresIn: "15m",
    },
    tokentype: "access",
  });
  const refreshToken = generateToken({
    payload: { _id: decoded._id },
    options: {
      expiresIn: "7d",
    },
    tokentype: "refresh",
  });

  return { accessToken, refreshToken, isUser };
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

export const refreshService = async (refreshToken) => {
  const decoded = verifyToken({ token: refreshToken, tokentype: "refersh" });
  const user = await findOneDoc({
    model: UserModel,
    filter: { id: decoded._id },
  });
  if (!user) throw errorHandle({ message: "not a user " });

  const accessToken = generateToken({
    payload: { _id: decoded._id },
    options: {
      expiresIn: "1h",
    },
    tokentype: "access",
  });
  return accessToken;
};
