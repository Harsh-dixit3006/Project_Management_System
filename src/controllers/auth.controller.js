/*
    Dekho sidha funda ye hai ki sabse pahle tum ekfunction banaoge registeruser naam ka aur phir usem sabse pahle
    user ka data frontend ke body se receive karenge fir check karoge ki kahi user already exist to nhi hai 
    agar nhi hai tab ek naya user bna ke usse save kar doge aur phir saare tokens ka kaam suru hoge 
    jaise temporary tokens use honge email verification ke liye
    phir ek alag se method bna lena jo ki access aur refresh tokens kop banayega aur phir lasst me 
    send mail wale function ko call karke saare options de ke mail send kar dena
    aur kuch return v to karna hoga req pe to uske liye ek variable bna ke usme kya nhi dena hai 
    usse mention kar dena fir res se return kar dena. 

*/
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  EmailVerificationMailGen,
  forgotPassContent,
  sendEmail,
} from "../utils/mail.js";

import jwt from "jsonwebtoken";

const createAccessAndRefreshtoken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while Generating Access token",
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  // The very first thing we will do is take input from user(body)
  const { email, userName, password, role } = req.body;

  //the second thing we will do is check if user already exist or not..

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exist, try using new email id", []);
  }

  // If user not exist then our task starts like store the user details..
  // SO we create a new user with all its details

  const user = await User.create({
    email,
    password,
    userName,
    isEmailVerified: false,
  });

  /*Now as user is created so the Token works start like
    sending Access token and storing refresh Token etc
    and in this method we have created the temporary tocken but for the other tokens 
    we will simply create new method so roll up side...
    dekho aise hai ki jo email verifications hote hai isme yhi temporary tokens use hote hai */

  const { unHashedTokens, hashedToken, tokenExpiry } =
    user.generateTemporaryTokens();
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  /*Now the final part about sending the email for which we will import the sendEmail
     function which we have created earlier and using that we will easily send the mail 
    by giving the options required by it .*/

  await sendEmail({
    to: user?.email,
    subject: "Please Verify Your Email",
    mailgenContent: EmailVerificationMailGen(
      user.userName,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedTokens}`,
    ),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refressToken -emailVerificationToken -emailVerificationExpiry",
  );
  if (!createdUser) {
    throw new ApiError(
      500,
      "Something Went wrong while registering the user kindly try again",
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "User Register Successfully and the verification email has been sent on registered mail",
      ),
    );
});

/* Ab dekho login controller ke liye sabse pahle we will take data from user and then we
   will validate it if user exist or not  and we will check if password is correct then will we simply generate tokens
    and send it through cookies 
*/
const loginUser = asyncHandler(async (req, res) => {
  const { email, password, userName } = req.body;
  if (!email) {
    throw new ApiError(400, "email is Required !");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User Does not Exist!");
  }
  const isPassCorrect = await user.isPasswordCorrect(password);
  if (!isPassCorrect) {
    throw new ApiError(404, "Invalid credentials ");
  }
  const { accessToken, refreshToken } = await createAccessAndRefreshtoken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "The user logged-In Successfully",
      ),
    );
});

/* Now the last part of logginout for which first of all we will get the info of user using the verifyJWT middleware 
so that we can log him out 
*/

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: "" },
    },
    { new: true },
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out successfully!"));
});

/* Now its time to serfe our PRD and accordingly we will create few more methods in which he very  first token would be :
1- getCurrentUser*/

const getCurrentUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user Fetched successfully"));
});

/* Now the second method will be for  verification of mail which we will call as:
2- verifyEmail  ab isme sabse pahle jo hum log unhashed token send kiye the sendEmail wale
   function me usse hashed karenge phir uski help se user banayenge agar user nhi exist karegea 
   tab error throw karnge warna phir verify kar denge*/

const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationtoken } = req.params;
  if (!verificationtoken) {
    throw new ApiError(400, "Email verification token is unavailable");
  }
  let hashedToken = crypto
    .createHash("sha256")
    .update("verificationtoken")
    .digest("hex");
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });
  if (!user) {
    throw new ApiError(400, "Email verification token is invalid or expired");
  }
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;

  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isEmailVerified: true },
        "User is verified Successfully!",
      ),
    );
});

/* Now lets move towards next method which is used to resend email verification named as:
3- resendEmailVerification isme  */

const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findOne(req.user?._id); // we have user.id because the user is logged in and then sending verification mail request
  if (!user) {
    throw new ApiError(404, "User Does Not exist");
  }
  if (verifyEmail) {
    throw new ApiError(409, "User is already Verified!");
  }
  await sendEmail({
    to: user?.email,
    subject: "Please Verify Your Email",
    mailgenContent: EmailVerificationMailGen(
      user.userName,
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedTokens}`,
    ),
  });
  return res
    .status(200)
    .json(
      new ApiError(200, {}, "VErification mail has been sent on your email"),
    );
});

/* Now the next method is Refresh the Access Token named as:
   4-refreshAccessToken  dekho sabse pahle tum jo incomming refresh tokens hai usse input lo aur
    phir usko verify karke decoded token me store kar lo phir uske hishab se user bna lo 
    agar nhi exist karega to error bhejna phir last me options bna ke 'createAccessAndRefressToken'
    wale function ko use karke naya accesstoken bna lo bs simple*/

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshtoken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshtoken) {
    throw new ApiError(401, "Unauthorized access");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshtoken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }
    if (refreshAccessToken != user?.refreshToken) {
      throw new ApiError(401, "Refresh token expired");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await createAccessAndRefreshtoken(user._id);

    res
      .status(200)
      .cookie("accessToken", accessToken.options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: refreshAccessToken },
          "Access Token Refreshed",
        ),
      );
  } catch (error) {
    throw new ApiError(401, "Refresh Token is Expired");
  }
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "Password Reset");
  }
  const { unHashedTokens, hashedToken, tokenExpiry } =
    user.generateTemporaryTokens();
  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });
  await sendEmail({
    to: user?.email,
    subject: "Reset Password",
    mailgenContent: forgotPassContent(
      user.userName,
      `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedTokens}`,
    ),
  });

  return res.status(200)``.json(
    new ApiResponse(
      200,
      {},
      "Password Reset mail has been sent on mail Successfully",
    ),
  );
});

const resetForgotPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;
  let hashedToken = crypto
    .createHash("sha254")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(409, "Token expired or Invalid");
  }
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse());
});

const changePasswordRequest = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = User.findById(req?._id);
  if (!user) {
    throw new ApiError(401, "Unauthorized user access");
  }

  const isPasswordValid = user.isPassCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError("Given Password was Incorrect !");
  }
  user.password = newPassword;
  return res
    .status(200)
    .json(new ApiResponse(200, "Password Changed Successfully !"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  verifyEmail,
  resendEmailVerification,
  refreshAccessToken,
  forgotPasswordRequest,
  resetForgotPassword,
  changePasswordRequest,
};

  
  
  
  
