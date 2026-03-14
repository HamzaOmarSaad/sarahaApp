import { Router } from "express";
import {
  gmailSigninService,
  loginService,
  logoutService,
  refreshService,
  sendOtpService,
  signupService,
  verifyOTPService,
} from "./auth.service.js";
import { errorHandle, sucessHandle } from "../../utils/resHandler.js";
import { loginSchema, signupSchema } from "./auth.validation.js";
import { validateMiddleware } from "../../middlewares/validation.middleware.js";
import { uploadMiddleware } from "../../middlewares/multer.middleware.js";
import { authentication } from "../../middlewares/security.middleware.js";
import { ProfilePictureService } from "../userModule/user.service.js";
import {
  logoutSchema,
  profileImageSchema,
} from "../userModule/user.validation.js";

const router = Router();

router.post("/signup", validateMiddleware(signupSchema), async (req, res) => {
  const { userName, password, email, gender } = req.body;

  const data = await signupService({ userName, password, email, gender });
  return sucessHandle({
    res,
    data,
    message: "user created sucessfully ",
    status: 201,
  });
});
router.post("/login", validateMiddleware(loginSchema), async (req, res) => {
  const { password, email } = req.body;
  const data = await loginService(email, password);
  return sucessHandle({
    res,
    data,
    message: "user entered sucessfully ",
    status: 200,
  });
});

router.post("/sendOTP", async (req, res) => {
  const { email } = req.body;
  await sendOtpService(email);

  res.json({ message: "OTP sent" });
});

router.post("/verifyOTP", async (req, res) => {
  const { email, otp } = req.body;
  await verifyOTPService(email, otp);

  res.json({ message: "Email verified successfully" });
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  const accessToken = await refreshService(refreshToken);

  res.json({ data: accessToken });
});

router.post("/signup/google", async (req, res) => {
  const { googleToken } = req.body;
  const data = await gmailSigninService(googleToken);
  return sucessHandle({ res, data });
});

router.patch(
  "/logout",
  authentication,
  validateMiddleware(logoutSchema),
  async (req, res, next) => {
    const flag = req.body;

    const { data } = await logoutService({
      user: req.user,
      flag,
      jti: req.decoded.jti,
      iat: req.decoded.iat,
    });
    return sucessHandle({ res, message: "logout sucessfully", data });
  },
);

export default router;
