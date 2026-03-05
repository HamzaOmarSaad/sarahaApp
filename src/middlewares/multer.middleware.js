import multer, { diskStorage } from "multer";
import fs from "fs/promises";
import { resolve } from "path";

export const fileTypes = {
  image: ["image/png", "image/jpg", "image/jpeg"],
  video: ["video/mp4", "video/webm"],
};

export const uploadMiddleware = ({
  dest = "general",
  validation = "image",
  sizeInKB = 5000,
}) => {
  const storage = diskStorage({
    // wher to save file
    destination: async (req, file, cb) => {
      const finalPath = `./uploads/${dest}`;
      const folderPath = resolve(finalPath);
      try {
        // check if it is created
        await fs.access(folderPath, fs.constants.F_OK);
      } catch (err) {
        // if not create it
        await fs.mkdir(folderPath, { recursive: true });
      }
      // attach final path to the file object that is returned
      file.finalPath = finalPath;
      cb(null, folderPath);
    },
    //file name convention
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + "-" + file.originalname;
      file.finalPath += `/${uniqueName}`;
      cb(null, uniqueName);
    },
  });
  // validation for format
  const fileFilter = (req, file, cb) => {
    if (fileTypes[validation]?.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("invalid format"), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: sizeInKB * 1024,
    },
  });
};
