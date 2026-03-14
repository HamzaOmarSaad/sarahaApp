//for token handler
import { errorHandle } from "../utils/resHandler.js";
import { findOneDoc } from "../DB/repos/repo.js";
import UserModel from "../DB/models/userModel.js";
import { verifyToken } from "../security/token.security.js";
import TokenModel from "../DB/models/revokedToken.model.js";
import { getValue } from "../DB/repos/redis.repo.js";

export const authentication = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw errorHandle({ message: "No token provided", status: 401 });
  }

  const [start, token] = authorization.split(" ");
  if (start != "bearer") {
    throw errorHandle({ message: "wrong token type", status: 401 });
  }
  if (!token) {
    throw errorHandle({
      message: "Invalid authorization format",
      status: 401,
    });
  }

  const decoded = verifyToken({
    token,
    tokentype: "access",
  });
  // one devices logout identified by jti (unique for every token)

  //* revoke token use mongodb as a way to store jti
  // const isbanned = await findOneDoc({
  //   model: TokenModel,
  //   filter: { jti: decoded.jti },
  // });

  // if (isbanned) {
  //   throw errorHandle({ message: " banned token ", status: 404 });
  // }
  //* revoke token use redis as a way to store jti
  const isbanned = await getValue({
    key: keyGenrator({
      purpose: revokeToken,
      userId: decoded._id,
      jti: decoded.jti,
    }),
  });

  if (isbanned) {
    throw errorHandle({
      message: " banned token please login again  ",
      status: 401,
    });
  }

  const user = await findOneDoc({
    model: UserModel,
    filter: { _id: decoded._id },
  });

  if (!user) {
    throw errorHandle({ message: "User not found", status: 404 });
  }
  // all devices logout
  if (
    user.credantialChangedAt &&
    user.credantialChangedAt.getTime() >= decoded.iat * 1000
  ) {
    throw errorHandle({ message: "invalid login session", status: 404 });
  }

  req.user = user;
  req.decoded = decoded;
  next();
};
export const authorization = (roles = []) => {
  async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw errorHandle({ message: " not authorized user ", status: 401 });
    }
    next();
  };
};
