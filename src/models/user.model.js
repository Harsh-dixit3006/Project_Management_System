/* Sab mila ke modelke andar pahli chiz hai userScema jo ki poora structure user ka hota hai
and then dooshri chiz jo hai password joki bcrypt hona chahiye before getting saved using pre
then tishri chiz hai saare tokens bna lo jaise {refreshToken, AccessToken, TemporaryToken} */


import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";


const userSchema = new Schema(
  {
    avatar: {
      type: {
        url: String,
        localpath: String,
      },
      default: {
        url: "https://placehold.co/200x200",
        localpath: String,
      },
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Passwored is required"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

/*Pre is a type of HOOK which Hashesh the password before storing it into database.
basically agar password modified nhi hua hai to return kar jaao encrypt mt karo 
baar baar warna phir aage badho aur encrypt kardo pass ko*/

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// Now the Schema method used to check weather the user ha inserted the correct password or not.

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};


/* Generating Access Tokens and setting its live in time period
 Dekho AccessToken me 3 chiz hoti hai {Payload + Secret Code + Expiry Time }*/
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id, //PayLoad
      email: this.email,
      userName: this.userName,
    },
    process.env.ACCESS_TOKEN_SECRET, //Secret Code
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY, //Expiry time limit
    },
  );
};

// Generating Refresh Token and setting its live in time interval

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

// Now last the temporary tokens generating and setting its time limit

userSchema.methods.generateTemporaryTokens = function () {
  const unHashedTokens = crypto.randomBytes(20).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedTokens)
    .digest("hex");

  const tokenExpiry = Date.now() + 20 * 60 * 1000; // 20 minutes

  return { unHashedTokens, hashedToken, tokenExpiry };
};

export const User = mongoose.model("User", userSchema);
