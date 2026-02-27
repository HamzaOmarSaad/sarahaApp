import UserModel from "../../DB/models/userModel.js";
import { createDoc, findOneDoc } from "../../DB/repos/repo.js";
import { provider } from "../../enums/security.enums.js";
import { compareHash, generateHash } from "../../security/Hashing.security.js";
import {
  generateToken,
  verifyToken,
  createLoginTokens,
} from "../../security/token.security.js";
import { errorHandle } from "../../utils/resHandler.js";
import { OAuth2Client } from "google-auth-library";

// google login client
const client = new OAuth2Client(
  "884770927564-aqqt68ea32mh8rnl9rdm2bbu2ak5hm8s.apps.googleusercontent.com",
);
export const signupService = async ({ username, password, email, gender }) => {
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
    username,
    email,
    gender,
    password: hashedPass,
  };
  const user = await createDoc({ model: UserModel, data });
  return user;
};

export const loginService = async (email, password, iss) => {
  const isUser = await findOneDoc({
    filter: { email },
    model: UserModel,
    select: "_id email password username",
  });
  // chech provider
  if (isUser.provider == provider.google) {
    throw errorHandle({
      message: "different provider use google login ",
      status: 409,
    });
  }
  // check email
  if (!isUser) {
    throw errorHandle({ message: "wrong credantials", status: 402 });
  }
  // check password
  const match = await compareHash(password, isUser.password);
  if (!match) {
    throw errorHandle({ message: "wrong credantials", status: 402 });
  }
  //create token
  const { accessToken, refreshToken } = createLoginTokens({
    iss,
    user: isUser,
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
export const reSendOtpService = async (email) => {
  if (user.otpExpires > Date.now() - 60 * 1000) {
    throw new Error("Wait before requesting another OTP");
  }
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
    tokentype: tokenTypeEnum.access,
  });
  return accessToken;
};
export const gmailSigninService = async (googleToken) => {
  const ticket = await client.verifyIdToken({
    idToken: googleToken,
    audaince:
      "884770927564-aqqt68ea32mh8rnl9rdm2bbu2ak5hm8s.apps.googleusercontent.com",
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
      iss,
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
