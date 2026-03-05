import UserModel from "../../DB/models/userModel.js";
import { updateDocByid } from "../../DB/repos/repo.js";
import fs from "fs/promises";
import path from "path";
import { errorHandle } from "../../utils/resHandler.js";

export const ProfilePictureService = async (user, picturePath) => {
  if (user?.profilePicture) {
    try {
      const absolutePath = path.join(process.cwd(), user.profilePicture);
      await fs.unlink(absolutePath);
    } catch (err) {
      console.log("Old image not found, skipping delete");
    }
  }
  const updatedUser = await updateDocByid({
    model: UserModel,
    id: user._id,
    updatedValue: { profilePicture: picturePath },
  });
  return updatedUser;
};
export const delProfilePictureService = async (user) => {
  if (user?.profilePicture) {
    try {
      const absolutePath = path.join(process.cwd(), user.profilePicture);
      await fs.unlink(absolutePath);
    } catch (err) {
      console.log("Old image not found, skipping delete");
    }
    await UserModel.findByIdAndDelete(user._id, {
      profilePicture,
    });
  } else {
    throw errorHandle({
      message: "no profile picture for this user ",
    });
  }

  return { state: "deleted suceessgfullyy" };
};
export const coverImagesService = async ({ user, picturePaths = [] }) => {
  if (user.coverPictures.length >= 2) {
    for (const picPath of user.coverPictures) {
      try {
        const absolutePath = path.join(process.cwd(), picPath);

        await fs.unlink(absolutePath);
      } catch (err) {
        console.log("Old image not found, skipping delete");
      }
    }
  }
  const updatedUser = await UserModel.updateOne(
    { _id: user._id },
    { $set: { coverPictures: picturePaths } },
    { new: true },
  );
  return updatedUser;
};
