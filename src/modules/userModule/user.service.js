import UserModel from "../../DB/models/userModel.js";
import { deleteDoc, updateDocByid } from "../../DB/repos/repo.js";
import fs from "fs/promises";
import path from "path";
import { errorHandle } from "../../utils/resHandler.js";
import {
  cloudFileDel,
  cloudFileUpload,
  deleteFolder,
  deleteFolderAssets,
} from "../../utils/multer/cloudinary.services.js";

export const deleteUserDiskStorage = async (user) => {
  if (user.profilePicture) {
    try {
      const absolutePath = path.join(process.cwd(), user.profilePicture);

      await fs.unlink(absolutePath);
    } catch (err) {
      console.log("Old image not found, skipping delete");
    }
  }
  if (user.coverPictures) {
    for (let i = 0; i < user.coverPictures.length; i++) {
      try {
        const absolutePath = path.join(process.cwd(), user.coverPictures[i]);
        await fs.unlink(absolutePath);
      } catch (err) {
        console.log("Old image not found, skipping delete");
      }
    }
  }

  await deleteDoc({ model: UserModel, filter: { _id: user._id } });
};
export const deleteUserCloudStorage = async (user) => {
  if (user.cloudProfilePicture?.public_id) {
    await deleteFolderAssets({
      folder: `sarahaApp/users/${user._id}/profilePicture`,
    });
    await deleteFolder({
      folder: `sarahaApp/users/${user._id}/profilePicture`,
    });
  }
  if (user.cloudCoverPictures.length) {
    await deleteFolderAssets({
      folder: `sarahaApp/users/${user._id}/coverpics`,
    });
    await deleteFolder({ folder: `sarahaApp/users/${user._id}/coverpics` });
  }
  await deleteDoc({ model: UserModel, filter: { _id: user._id } });
};

// SAVING to the disk storage

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
    await UserModel.findByIdAndUpdate(
      user._id,
      { $unset: { profilePicture: 1 } },
      { new: true },
    );
  } else {
    throw errorHandle({
      message: "no profile picture for this user ",
    });
  }

  return { state: "deleted suceessgfullyy" };
};
export const coverImagesService = async ({
  user,
  picturePaths = [],
  limit = 2,
}) => {
  const currentPictures = user.coverPictures || [];

  const totalAfterUpload = currentPictures.length + picturePaths.length;

  let imagesToDelete = totalAfterUpload - limit;

  if (imagesToDelete > 0) {
    for (let i = 0; i < imagesToDelete; i++) {
      try {
        const absolutePath = path.join(process.cwd(), currentPictures[i]);
        await fs.unlink(absolutePath);
      } catch (err) {
        console.log("Old image not found, skipping delete");
      }
    }

    currentPictures.splice(0, imagesToDelete);
  }

  const updatedPictures = [...currentPictures, ...picturePaths];

  const updatedUser = await UserModel.findByIdAndUpdate(
    user._id,
    { $set: { coverPictures: updatedPictures } },
    { new: true },
  );

  return updatedUser;
};

// saving in the disk storage first then to the cloud
export const cloudProfilePictureService = async (user, filePath) => {
  if (user?.cloudProfilePicture) {
    await cloudFileDel({ public_id: user.cloudProfilePicture.public_id });
  }
  try {
    const { public_id, secure_url } = await cloudFileUpload({
      filePath: filePath,
      options: { folder: `sarahaApp/users/${user._id}/profilePicture` },
    });
    await fs.unlink(filePath);
    const updatedUser = await updateDocByid({
      model: UserModel,
      id: user._id,
      updatedValue: {
        cloudProfilePicture: {
          public_id,
          secure_url,
        },
      },
    });
    return updatedUser;
  } catch (error) {
    throw errorHandle({
      message: "error uploading image to cloud",
      status: 500,
    });
  }
};

export const cloudCoverImagesService = async ({
  user,
  picturePaths = [],
  limit = 2,
}) => {
  let currentPictures = user.cloudCoverPictures || [];
  const newPicturesCount = picturePaths.length;

  const totalAfterUpload = currentPictures.length + newPicturesCount;

  let imagesToDelete = totalAfterUpload - limit;

  if (imagesToDelete > 0) {
    for (let i = 0; i < imagesToDelete; i++) {
      await cloudFileDel({
        public_id: currentPictures[i].public_id,
      });
    }

    currentPictures.splice(0, imagesToDelete);
  }

  const uploadedPictures = [];

  for (let i = 0; i < picturePaths.length; i++) {
    const { public_id, secure_url } = await cloudFileUpload({
      filePath: picturePaths[i],
      options: { folder: `sarahaApp/users/${user._id}/coverpics` },
    });

    uploadedPictures.push({ public_id, secure_url });
  }

  const finalPictures = [...currentPictures, ...uploadedPictures];

  const updatedUser = await UserModel.findByIdAndUpdate(
    user._id,
    { $set: { cloudCoverPictures: finalPictures } },
    { new: true },
  );

  return updatedUser;
};
