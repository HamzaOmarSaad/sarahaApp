import jwt from "jsonwebtoken";
import {
  ACCESS_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
  REFRESH_EXPIRES_IN,
  SYSTEM_JWT_REFRESH_SECRET,
  SYSTEM_JWT_SECRET,
} from "../../config/config.service.js";
import {
  audianceEnum,
  RoleEnum,
  tokenTypeEnum,
} from "../enums/security.enums.js";

export const generateToken = ({ payload, options, tokentype, signature }) => {
  if (tokentype == tokenTypeEnum.access) {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: ACCESS_EXPIRES_IN,
      ...options,
    });
  } else if (tokentype == tokenTypeEnum.referesh) {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_EXPIRES_IN,
      ...options,
    });
  }
};
export const verifyToken = ({ token, tokentype }) => {
  try {
    if (tokentype === "access") {
      return jwt.verify(token, process.env.JWT_SECRET);
    }

    if (tokentype === "refresh") {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    }
  } catch (err) {
    throw errorHandle({
      message: "Token verification failed",
      status: 401,
    });
  }
};

export const createLoginTokens = ({ iss = "", user, audiance = "" }) => {
  const accessToken = generateToken({
    payload: { _id: user._id },
    options: {
      expiresIn: ACCESS_EXPIRES_IN,
      issuer: iss,
      // audiance: [tokenTypeEnum.access, audiance],
    },
    tokentype: tokenTypeEnum.access,
  });
  const refreshToken = generateToken({
    payload: { _id: user._id },
    options: {
      expiresIn: REFRESH_EXPIRES_IN,
      issuer: iss,
      // audiance: [tokenTypeEnum.referesh],
    },
    tokentype: tokenTypeEnum.referesh,
  });
  return { accessToken, refreshToken };
};
// audiance based signature choosing (not implemented yet  )
export const getSignature = (role) => {
  let accessSignature = undefined;
  let refeshSignature = undefined;
  let audiance = audianceEnum.user;
  switch (role) {
    case RoleEnum.admin:
      accessSignature = SYSTEM_JWT_SECRET;
      refeshSignature = SYSTEM_JWT_REFRESH_SECRET;
      audiance = audianceEnum.system;
      break;

    default:
      accessSignature = JWT_SECRET;
      refeshSignature = JWT_REFRESH_SECRET;

      break;
  }
  return {
    signatures: { accessSignature, refeshSignature },
    audiance,
  };
};
