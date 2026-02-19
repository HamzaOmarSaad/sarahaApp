export const FindUserProfileService = async (id) => {
  const isUser = await findOneDoc({
    filter: { email },
    model: UserModel,
    select: "email password username",
  });
  if (!isUser) {
    throw errorHandle({ message: "wrong credantials", status: 402 });
  }
  const match = await compareHash(password, isUser.password);
  if (!match) {
    throw errorHandle({ message: "wrong credantials", status: 402 });
  }
  return isUser;
};
