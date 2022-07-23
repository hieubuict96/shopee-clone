import express from "express";
const router = express.Router();
import {
  validatePhoneNumber,
  validateInfo,
  upload,
  validateUpdate,
  requireSignin,
  validateEmail,
} from "../common-middleware/user.js";
import {
  sendPhoneNumber,
  sendCode,
  resendCode,
  signup,
  signin,
  signinWithGoogle,
  signinWithFacebook,
  getData,
  updateController,
  sendCodeToEmail,
  verifyCodeUpdateEmail
} from "../controller/userController.js";

router.post("/signup/send-phone-number", validatePhoneNumber, sendPhoneNumber);
router.post("/signup/send-code", sendCode);
router.post("/signup/resend-code", resendCode);
router.post("/signup", validateInfo, signup);
router.post("/signin", signin);
router.post("/signin-with-google", signinWithGoogle);
router.post("/signin-with-facebook", signinWithFacebook);
router.get("/get-data", getData);
router.put(
  "/profile/update",
  requireSignin,
  upload.fields([{ name: "imgBuyer" }, { name: "imgShop" }]),
  validateUpdate,
  updateController
);
router.put(
  "/profile/update/email/send-code",
  requireSignin,
  validateEmail,
  sendCodeToEmail
);
router.put(
  "/profile/update/email/verify-code",
  requireSignin,
  verifyCodeUpdateEmail
);

export default router;
