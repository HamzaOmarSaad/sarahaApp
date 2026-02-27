//for token handler
import { errorHandle } from "../utils/resHandler.js";
import { findOneDoc } from "../DB/repos/repo.js";
import UserModel from "../DB/models/userModel.js";
import { verifyToken } from "../security/token.security.js";

export const authentication = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    throw errorHandle({ message: "no token sent", status: 401 });
  }
  const token = authorization.split(" ")[1];
  try {
    const decoded = verifyToken({ token, tokentype: "access" });

    const user = await findOneDoc({
      model: UserModel,
      filter: { id: decoded._id },
    });
    if (!user) throw errorHandle({ message: "not a user " });

    req.user = user;
    next();
  } catch (error) {
    throw errorHandle({ message: "invalid token  ", status: 401 });
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
