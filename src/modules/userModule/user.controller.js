import { Router } from "express";
import { uploadMiddleware } from "../../middlewares/multer.middleware.js";
import { sucessHandle } from "../../utils/resHandler.js";
import UserModel from "../../DB/models/userModel.js";
import { authentication } from "../../middlewares/security.middleware.js";
import {
  cloudCoverImagesService,
  cloudProfilePictureService,
  coverImagesService,
  delProfilePictureService,
  ProfilePictureService,
} from "./user.service.js";
import { validateMiddleware } from "../../middlewares/validation.middleware.js";
import {
  profileImageCloudSchema,
  profileImageSchema,
} from "./user.validation.js";
import { cloudUploadMiddleware } from "../../middlewares/cloud.middleware.js";
import {
  cloudFileUpload,
  memocloudFileUpload,
} from "../../utils/multer/cloudinary.services.js";

const router = Router();
router.get("/userinfo", authentication, async (req, res, next) => {
  const user = await UserModel.findById(req.user._id);
  return sucessHandle({ res, message: "sucess", data: user });
});

// saving in desk storage
router.patch(
  "/profile-picture",
  authentication,
  uploadMiddleware({ dest: "users/profilePictures" }).single("images"),
  validateMiddleware(profileImageSchema),
  async (req, res, next) => {
    const user = await ProfilePictureService(req.user, req.file.finalPath);

    return sucessHandle({ res, message: "sucess", data: user });
  },
);
router.patch(
  "/cover-images",
  uploadMiddleware({ dest: "users/coverImages", validation: "image" }).array(
    "coverImages",
    3,
  ),
  authentication,
  async (req, res, next) => {
    const paths = [];
    req.files.map((file) => paths.push(file.finalPath));

    const user = await coverImagesService({
      user: req.user,
      picturePaths: paths,
    });

    return sucessHandle({ res, message: "sucess", data: user });
  },
);
router.delete("/del-profile-pic", authentication, async (req, res, next) => {
  await delProfilePictureService(req.user);
  return sucessHandle({ res, message: "sucess", data: user });
});

// saving in the cloud disk => cloud
router.patch(
  "/cloud-profile-picture",
  authentication,
  cloudUploadMiddleware({}).single("image"),
  // validateMiddleware(profileImageCloudSchema),
  async (req, res, next) => {
    const user = await cloudProfilePictureService(req.user, req.file.path);
    return sucessHandle({ res, message: "sucess", data: user });
  },
);
router.patch(
  "/cloud-cover-images",
  cloudUploadMiddleware({}).array("coverImages", 3),
  authentication,
  async (req, res, next) => {
    const paths = req.files.map((file) => file.path);
    console.log("🚀 ~ paths:", paths);

    const user = await cloudCoverImagesService({
      user: req.user,
      picturePaths: paths,
    });

    return sucessHandle({ res, message: "sucess", data: user });
  },
);

//
//
// saving in the cloud memo => cloud

router.post(
  "/memory-to-cloud-upload-pic",
  cloudUploadMiddleware.single("image"),
  async (req, res) => {
    try {
      const result = await memocloudFileUpload({
        buffer: req.file.buffer,
        folder: "/profile-pic-memory",
      });

      res.json({
        message: "uploaded",
        url: result.secure_url,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },
);
export default router;
