import jwt from "jsonwebtoken";
import crypto from "crypto";
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

export const generateToken = ({
  payload,
  role = RoleEnum.user,
  options = {},
  tokentype,
  signatures,
}) => {
  if (tokentype == tokenTypeEnum.access) {
    return jwt.sign(payload, signatures.accessSignature, {
      expiresIn: ACCESS_EXPIRES_IN,
      audience: role,
      ...options,
    });
  } else if (tokentype == tokenTypeEnum.referesh) {
    return jwt.sign(payload, signatures.refeshSignature, {
      expiresIn: REFRESH_EXPIRES_IN,
      audience: role,
      ...options,
    });
  }
};

export const createLoginTokens = ({ iss = "", user, audiance, signatures }) => {
  const jwtid = crypto.randomUUID();

  const accessToken = generateToken({
    payload: { _id: user._id },
    signatures,
    tokentype: tokenTypeEnum.access,
    signatures,
    role: [tokenTypeEnum.access, audiance],

    options: {
      expiresIn: ACCESS_EXPIRES_IN,
      issuer: iss,
      jwtid,
    },
  });
  const refreshToken = generateToken({
    payload: { _id: user._id },
    tokentype: tokenTypeEnum.referesh,
    signatures,
    role: [tokenTypeEnum.referesh, audiance],

    options: {
      expiresIn: REFRESH_EXPIRES_IN,
      issuer: iss,
      jwtid,
    },
  });
  return { accessToken, refreshToken };
};
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
