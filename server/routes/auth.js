import express from "express";
import {
  getallusers,
  Login,
  Signup,
  updateprofile,
  forgotPassword,
  updatePassword,
  transferPoints,
  verifyLoginOTP,
  requestLanguageChangeOTP,
  verifyLanguageChangeOTP
} from "../controller/auth.js";

const router = express.Router();
import auth from "../middleware/auth.js";
router.post("/signup", Signup);
router.post("/login", Login);
router.post("/forgot-password", forgotPassword);
router.get("/getalluser", getallusers);
router.patch("/update/:id", auth, updateprofile);
router.patch("/update-password/:id", auth, updatePassword);
router.post("/transfer-points", auth, transferPoints);
router.post("/verify-login-otp", verifyLoginOTP);
router.post("/request-language-otp", auth, requestLanguageChangeOTP);
router.post("/verify-language-otp", auth, verifyLanguageChangeOTP);
export default router;
