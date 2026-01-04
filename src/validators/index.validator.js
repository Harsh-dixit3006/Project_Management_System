import { body } from "express-validator";

const userRegisterValidataor = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Enter Valid Email Address"),
    body("userName")
      .trim()
      .notEmpty()
      .withMessage("Username is Required")
      .isLowercase()
      .isLength({ min: 3 }, { max: 10 })
      .withMessage("the userName must be of min 3 and max 10 length long")
      .withMessage("UserName should be in Lower Case"),

    body("password").trim().notEmpty().withMessage("Password is Required"),
    body("fullName").optional().trim(),
  ];
};

const userLoggedinValidator = () => {
  return [
    body("email").notEmpty().withMessage("Email Required"),
    body("password").notEmpty().withMessage("password required"),
  ];
};

const changeCurrentPass = () => {
  return [
    body("oldPassword").notEmpty().withMessage("Old pass is required"),
    body("newPassword").notEmpty().withMessage("new pass is required"),
  ];
};

const forgotPassValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid Email"),
  ];
};

const resetForgotPassValidator = () => {
  return [body("password").notEmpty().withMessage("Password is required")];
};

export {
  userRegisterValidataor,
  userLoggedinValidator,
  forgotPassValidator,
  resetForgotPassValidator,
  changeCurrentPass,
};
