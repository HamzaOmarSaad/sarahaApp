//for token handler
import { errorHandle } from "../utils/resHandler.js";
import { findOneDoc } from "../DB/repos/repo.js";
import UserModel from "../DB/models/userModel.js";
import { verifyToken } from "../security/token.security.js";

export const authentication = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw errorHandle({ message: "No token provided", status: 401 });
    }

    const token = authorization.split(" ")[1];
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

    const user = await findOneDoc({
      model: UserModel,
      filter: { _id: decoded._id },
    });

    if (!user) {
      throw errorHandle({ message: "User not found", status: 404 });
    }

    req.user = user;
    next();
  } catch (error) {
    next(errorHandle({ message: "Invalid or expired token", status: 401 }));
  }
};
export const authorization = (roles = []) => {
  async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw errorHandle({ message: " not authorized user ", status: 401 });
    }
    next();
  };
};
