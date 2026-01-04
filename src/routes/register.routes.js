import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  refreshAccessToken,
  resetForgotPassword,
  forgotPasswordRequest,
  getCurrentUser,
  resendEmailVerification,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  forgotPassValidator,
  userLoggedinValidator,
  userRegisterValidataor,
  forgotPassValidator,
  resetForgotPassValidator,
  changeCurrentPass,
} from "../validators/index.validator.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

// Unsecured route: jab user logged in nhi hota hai to uske pass koi token nhi hota hai to jwt verify
//  ki jaroorat nhi hoti hai to unsecured route me aata hai

router
  .route("/register")
  .post(userRegisterValidataor(), validate, registerUser);
router.route("/login").post(userLoggedinValidator(), validate, loginUser);
router.route("/verify-email/:verificationtoken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);
router
  .route("/forgot-password")
  .post(forgotPassValidator(), validate, forgotPasswordRequest);
router
  .route("/reset-password/:resetToken")
  .post(resetForgotPassValidator(), validate, resetForgotPassword);

// /register -> useregisterValidator -> validate(middleware) -> registerUser

// Secured route : jab user loged in hai to uske pass jwt tokens honge aur o jab v koi request karega
// to usse pahle verify karna hoga ki ha wo whi hai issliye ye secured route hota hai .

router.route("/logout").post(verifyJWT, logoutUser); // to store the info of user .
router.route("/current-user").get(verifyJWT, getCurrentUser);
router
  .route("/change-password")
  .post(verifyJWT, changeCurrentPass(), validate, changeCurrentPass);
router
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerification);
export default router;
