import { Router } from "express";
import {
  gmailSigninService,
  loginService,
  refreshService,
  sendOtpService,
  signupService,
  verifyOTPService,
} from "./auth.service.js";
import { errorHandle, sucessHandle } from "../../utils/resHandler.js";
import { loginSchema, signupSchema } from "./auth.validation.js";
import { valdiateMiddleware } from "../../middlewares/validation.middleware.js";

const router = Router();

router.post("/signup", valdiateMiddleware(signupSchema), async (req, res) => {
  const { username, password, email, gender } = req.body;

  const data = await signupService({ username, password, email, gender });
  return sucessHandle({
    res,
    data,
    message: "user created sucessfully ",
    status: 201,
  });
});
router.post("/login", valdiateMiddleware(loginSchema), async (req, res) => {
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

export default router;
