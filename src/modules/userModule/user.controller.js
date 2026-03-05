import { Router } from "express";
import { upload } from "../../middlewares/multer.middleware.js";
import { sucessHandle } from "../../utils/resHandler.js";
import UserModel from "../../DB/models/userModel.js";
import { authentication } from "../../middlewares/security.middleware.js";
import { coverImagesService, ProfilePictureService } from "./user.service.js";
import { validateMiddleware } from "../../middlewares/validation.middleware.js";
import { profileImageSchema } from "./user.validation.js";

const router = Router();
router.get("/userinfo", authentication, async (req, res, next) => {
  const user = await UserModel.findById(req.user._id);
  return sucessHandle({ res, message: "sucess", data: user });
});

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

export default router;
