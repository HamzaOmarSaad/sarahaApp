import fs from "fs/promises";
import path from "node:path";
import UserModel from "../../DB/models/userModel.js";
import { createDoc, findOneDoc } from "../../DB/repos/repo.js";
import { provider } from "../../enums/security.enums.js";
import { compareHash, generateHash } from "../../security/Hashing.security.js";
import {
  generateToken,
  verifyToken,
  createLoginTokens,
  getSignature,
} from "../../security/token.security.js";
import { errorHandle } from "../../utils/resHandler.js";
import { OAuth2Client } from "google-auth-library";
import TokenModel from "../../DB/models/revokedToken.model.js";
import { logoutType } from "../../enums/security.enums.js";
import {
  getValue,
  TokenkeyGenrator,
  setValue,
} from "../../DB/repos/redis.repo.js";
import { CLIENT_ID } from "../../../config/config.service.js";
import { otpkeyGenerator, sendOtp, verifyOtp } from "../../utils/OTPHandler.js";

// google login client
const client = new OAuth2Client(CLIENT_ID);
//---------------------sign up and confirmation -----------------------
//* signing up and sending otp
export const signupService = async ({ userName, password, email, gender }) => {
  const isEmail = await findOneDoc({
    filter: { email },
    model: UserModel,
    select: "email",
  });
  if (isEmail) {
    throw errorHandle({ message: "email alredy exist", status: 400 });
  }
  let hashedPass = undefined;
  if (password) {
    hashedPass = await generateHash({ text: password });
  }

  const data = {
    userName,
    email,
    gender,
    password: hashedPass,
    provider: provider.system,
  };
  const user = await createDoc({ model: UserModel, data });
  await sendOtp(email, "signup");
  return user;
};
//* verfiying the email and setting 2 step verfication on

export const confirmEmail = async (email, otp) => {
  verifyOtp(email, otp, "signup");
};
//---------------------login and confirmation -----------------------
//* log in without two step verfication and if found then sending otp
export const loginService = async (email, password, iss) => {
  const isUser = await findOneDoc({
    filter: { email },
    model: UserModel,
    select: "_id email password  firstName lastName",
  });
  // check email
  if (!isUser) {
    throw errorHandle({ message: "wrong credantials", status: 402 });
  }
  // chech provider
  if (isUser.provider == provider.google) {
    throw errorHandle({
      message: "different provider use google login ",
      status: 409,
    });
  }
  // check password
  const match = await compareHash({ text: password, hashed: isUser.password });
  if (!match) {
    throw errorHandle({ message: "wrong credantials", status: 402 });
  }
  if (!isUser.twoFactorEnabled) {
    const { signatures, audiance } = getSignature(isUser.role);
    const { accessToken, refreshToken } = createLoginTokens({
      iss: "system",
      user: isUser,
      signatures,
      audiance,
    });
    return { accessToken, refreshToken, isUser };
  } else {
    await sendOtp(email, "login");
    return { message: "otp sent" };
  }
};
//* verfiying the email and sending tokens

export const confirmloginEmail = async (email, otp) => {
  const user = await verifyOtp(email, otp, "login");
  const { signatures, audiance } = getSignature(user.role);
  const { accessToken, refreshToken } = createLoginTokens({
    iss: "system",
    user: user,
    signatures,
    audiance,
  });
  return { accessToken, refreshToken, user };
};
//---------------------sign up using gmail -----------------------

export const gmailSigninService = async (googleToken) => {
  const ticket = await client.verifyIdToken({
    idToken: googleToken,
    audience: CLIENT_ID,
  });
  const { email, name, email_verified } = ticket.getPayload();

  const isEmailExist = await findOneDoc({
    model: UserModel,
    filter: { email },
  });
  // we create token in both cases if login or sign up
  let accessToken;
  let refreshToken;
  let userInfo;
  // login case
  if (isEmailExist) {
    if (isEmailExist.provider == provider.system) {
      throw errorHandle({
        message: "different provider use system login ",
        status: 409,
      });
    }
    tokens = createLoginTokens({
      iss: "google",
      user: isEmailExist,
    });
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
    userInfo = isEmailExist;
  } else {
    // sign up
    const data = {
      username: name,
      email,
      provider: provider.google,
      isEmailConfirmend: email_verified,
    };
    const user = await createDoc({ model: UserModel, data });
    token = createLoginTokens({
      iss,
      user: user,
    });
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
    userInfo = user;
  }
  return { accessToken, refreshToken, userInfo };
};
//---------------------log out-----------------------

export const logoutService = async ({
  user,
  jti,
  iat = "",
  flag = logoutType.allDevices,
}) => {
  if (flag == logoutType.allDevices) {
    user.credantialChangedAt = Date.now();
    await user.save();
  } else {
    //* revoke token use mongodb as a way to store jti

    // await TokenModel.create({
    //   userId: user._id,
    //   jti,
    //   expiresIn: new Date((iat + 7 * 24 * 60 * 60) * 1000),
    // });
    //* revoke token use redis as a way to store jti

    const key = TokenkeyGenrator({
      userId: user._id,
      jti,
    });
    await setValue({
      key,
      value: jti,
      ttl: 7 * 24 * 60 * 60,
    });
  }

  return { data: {} };
};
//---------------------OTP for email VERFICATION -----------------------

export const sendOtpService = async (email, type) => {
  sendOtp(email, type);
};
export const reSendOtpService = async (email) => {
  const key = otpkeyGenerator({ email });

  const existingOtp = await getValue({ key });
  if (existingOtp) {
    throw new Error("Wait before requesting another OTP");
  }
  await sendOtp(email);
};
export const twoFactorEnableService = async (user, email) => {
  sendOtp(email);
  user.twoFactorEnabled = true;
  await user.save();
  return { message: "otp is sent" };
  S;
};

//---------------------refresh token searvice-----------------------

export const refreshTokenService = async (refreshToken) => {
  const decoded = verifyToken({ token: refreshToken, tokentype: "refresh" });
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
    tokentype: tokenTypeEnum.access,
  });
  return accessToken;
};
//------------------------- password services-------------------------
//* forget password
export const forgetPasswordService = async (email, newPassword, otp) => {
  const isverfird = verifyOtp(email, otp, "reset");
  if (!isverfird) {
    throw new Error("wrong otp");
  }
  const user = await findOneDoc({ model: UserModel, filter: { email } });
  const res = updateDocByid({
    model: UserModel,
    id: user._id,
    updatedValue: { password: newPassword },
  });
  return res;
};
