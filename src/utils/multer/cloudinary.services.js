import cloudinary from "./cloudinary.config.js";
import streamifier from "streamifier";

export const cloudFileUpload = async ({ filePath, folder, options = [] }) => {
  const uploaded = await cloudinary.uploader.upload(filePath, {
    folder,
    ...options,
  });
  return uploaded;
};
export const cloudFileDel = async ({ public_id }) => {
  return await cloudinary.uploader.destroy(public_id);
};
export const cloudFilesDel = async ({ public_ids = [] }) => {
  return await cloudinary.api.delete_all_resources(public_ids);
};

// to delte user we need to del assets then his folder
export const deleteFolderAssets = async ({ folder }) => {
  return await cloudinary.api.delete_resources_by_prefix(folder);
};
export const deleteFolder = async ({ folder }) => {
  return await cloudinary.api.delete_folder(folder);
};
//
//
//
//
//
//
//
//
//
//
//
///
///
//

// using buffer ans straeaming
export const memocloudFileUpload = async ({ buffer, folder }) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};
