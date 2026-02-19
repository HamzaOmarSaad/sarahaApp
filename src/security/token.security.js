import jwt from "jsonwebtoken";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../../config/config.service.js";

export const generateToken = ({ payload, options, tokentype }) => {
  if (tokentype == "access") {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m", ...options });
  } else if (tokentype == "refresh") {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: "1w",
      ...options,
    });
  }
};

export const verifyToken = ({ token, tokentype }) => {
  if (tokentype == "access") {
    return jwt.verify(token, JWT_SECRET);
  } else if (tokentype == "refresh") {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  }
};
