import multer, { diskStorage, memoryStorage } from "multer";

export const fileTypes = {
  image: ["image/png", "image/jpg", "image/jpeg"],
  video: ["video/mp4", "video/webm"],
};
// saving in the disk first then to the cloud
export const cloudUploadMiddleware = ({
  validation = "image",
  sizeInKB = 5000,
} = {}) => {
  const fileFilter = (req, file, cb) => {
    if (fileTypes[validation]?.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid format"), false);
    }
  };

  return multer({
    storage: diskStorage({}),
    fileFilter,
    limits: {
      fileSize: sizeInKB * 1024,
    },
  });
};
// saving in memo then to cloud

export const momocloudUploadMiddleware = ({
  validation = "image",
  sizeInKB = 5000,
} = {}) => {
  const fileFilter = (req, file, cb) => {
    if (fileTypes[validation]?.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid format"), false);
    }
  };

  return multer({
    storage: memoryStorage({}),
    fileFilter,
    limits: {
      fileSize: sizeInKB * 1024,
    },
  });
};
