import { Router } from "express";
import {
  confirmEmail,
  confirmloginEmail,
  forgetPasswordService,
  gmailSigninService,
  loginService,
  logoutService,
  refreshTokenService,
  reSendOtpService,
  sendOtpService,
  signupService,
  twoFactorEnableService,
} from "./auth.service.js";
import { errorHandle, sucessHandle } from "../../utils/resHandler.js";
import { loginSchema, signupSchema } from "./auth.validation.js";
import { validateMiddleware } from "../../middlewares/validation.middleware.js";
import { authentication } from "../../middlewares/security.middleware.js";
import { logoutSchema } from "../userModule/user.validation.js";

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
  const { email, type } = req.body;
  await sendOtpService(email, type);

  res.json({ message: "OTP sent" });
});
router.post("/2FA", authentication, async (req, res) => {
  const { email } = req.body;
  await twoFactorEnableService(req.user, email);

  res.json({ message: " two factor authentication  is enabled and OTP sent" });
});
router.post("/reSendOTP", async (req, res) => {
  const { email } = req.body;
  await reSendOtpService(email);

  res.json({ message: "OTP sent" });
});

router.post("/verifySigninOTP", async (req, res) => {
  const { email, otp } = req.body;
  await confirmEmail(email, otp);

  res.json({ message: "Email verified successfully" });
});
router.post("/verifyloginOTP", async (req, res) => {
  const { email, otp } = req.body;
  const data = await confirmloginEmail(email, otp);
  return sucessHandle({
    res,
    data,
    message: "user entered sucessfully ",
    status: 200,
  });

  res.json({ message: "Email verified successfully" });
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  const accessToken = await refreshTokenService(refreshToken);

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
router.post(
  "/forgetPassword",
  validateMiddleware(forgetPasswordSchema),
  async (req, res) => {
    const { email, newPassword, otp } = req.body;
    const data = await forgetPasswordService(email, newPassword, otp);
    return sucessHandle({ res, data });
  },
);

export default router;
