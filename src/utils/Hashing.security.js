import { argon2id, verify } from "argon2";
import bcrypt, { compare } from "bcrypt";

export const generateHash = async ({ text, model = "bcrypt" }) => {
  let hashed;
  if (model == "argon2") hashed = await argon2id.hash(text);

  if (model == "bcrypt") hashed = await bcrypt.hash(text, 10);
  return hashed;
};
export const compareHash = async ({ text, hashed, model = "bcrypt" }) => {
  let same = false;
  if (model == "argon2") same = await verify(hashed, text);
  if (model == "bcrypt") same = await compare(text, hashed);
  return same;
};
