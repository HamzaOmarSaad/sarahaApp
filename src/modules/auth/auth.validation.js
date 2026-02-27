import joi from "joi";
import { Gender } from "../../DB/enums/userEnums.js";
import { RoleEnum } from "../../enums/security.enums.js";

export const signupSchema = {
  body: joi.object().keys({
    userName: joi.string().min(10).required(),
    email: joi.string().email().required(),
    password: joi.string().min(10).required(),
    phone: joi.number().min(10),
    gender: joi.number().valid(...Object.values(Gender)),
    role: joi.number().valid(...Object.values(RoleEnum)),
  }),
};
export const loginSchema = {
  body: joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(10).required(),
    //   roles:joi.array().length(2)
  }),
  //   query: joi.object({
  //     username: joi.string().email().required(),
  //   }),
};
