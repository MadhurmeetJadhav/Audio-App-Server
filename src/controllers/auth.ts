import { RequestHandler } from "express";

import { CreateUser, VerifyEmailRequest } from "#/@types/user";
import Users from "#/models/users";
import { formatProfile, generateToken } from "#/utils/helper";
import {
  resendPasswordLink,
  sendPasswordSuccessEmail,
  sendVerificationMail,
} from "#/utils/mail";
import EmailVerificationToken from "#/models/emailVerificationToken";
import PasswordResetToken from "#/models/passwordResetToken";
import { isValidObjectId } from "mongoose";
import crypto from "crypto";
import { JWT_TOKEN, PASSWORD_RESET_LINK } from "#/utils/variables";
import jwt from "jsonwebtoken";
import { RequestWithFiles } from "#/middleware/fileParser";
import cloudinary from "#/cloud";
import formidable from "formidable";
//TO CREATE USER
export const create: RequestHandler = async (req: CreateUser, res) => {
  const { email, password, name } = req.body;

  const user = await Users.create({ name, email, password });
  //send email
  const token = generateToken();

  await EmailVerificationToken.create({
    owner: user._id,
    token: token,
  });
  //Code Comented send email to the mail

  sendVerificationMail(token, { name, email, userId: user._id.toString() });

  res.status(201).json({ user: { id: user._id, name, email } });
};

//TO VERIFY EMAIL
export const verifyEmail: RequestHandler = async (
  req: VerifyEmailRequest,
  res
) => {
  const { token, userId } = req.body;

  const verificationToken = await EmailVerificationToken.findOne({
    owner: userId,
  });

  if (!verificationToken)
    return res.status(403).json({ error: "Invalid Token" });

  const matched = await verificationToken?.compareToken(token);
  if (!matched) return res.status(403).json({ error: "Invalid Token" });

  await Users.findByIdAndUpdate(userId, {
    verified: true,
  });
  await EmailVerificationToken.findByIdAndDelete(verificationToken._id);

  res.json({ message: "Your email is verified." });
};

//To RE-VERIFY the token
export const sendReVerificationToken: RequestHandler = async (req, res) => {
  const { userId } = req.body;

  if (!isValidObjectId(userId))
    return res.status(403).json({ error: "Invalid Request" });

  const user = await Users.findById(userId);

  if (!user) return res.status(403).json({ error: "Invalid Request" });

  EmailVerificationToken.findOneAndDelete({
    owner: userId,
  });

  const token = generateToken();

  await EmailVerificationToken.create({
    owner: userId,
    token,
  });

  sendVerificationMail(token, {
    name: user?.name,
    email: user?.email,
    userId: user?._id.toString(),
  });

  res.status(200).json({ message: "Please check your mail." });
};

//To RESET PASSWORD
export const generateForgetPasswordLink: RequestHandler = async (req, res) => {
  const { email } = req.body;

  const user = await Users.findOne({ email });

  if (!user) return res.status(404).json({ error: "Account not found." });

  await PasswordResetToken.findOneAndDelete({
    owner: user._id,
  });

  const token = crypto.randomBytes(36).toString("hex");

  await PasswordResetToken.create({
    owner: user._id,
    token,
  });

  const resentLink = `${PASSWORD_RESET_LINK}?token=${token}&userId=${user._id}`;

  resendPasswordLink({ email, link: resentLink });

  res.json({ message: "Check your mail." });
};

//TO VERIFY RESET PASSWORD TOKEN
export const grantAccess: RequestHandler = async (req, res) => {
  res.json({ valid: "true" });
};

//To UPDATE PASSWORD
export const updatePassword: RequestHandler = async (req, res) => {
  const { password, userId } = req.body;

  const user = await Users.findById({
    _id: userId,
  });

  if (!user) return res.status(403).json({ error: "unauthorized access" });

  const matched = await user.comparePassword(password);
  if (matched)
    return res
      .status(200)
      .json({ error: "Password already used, Try new PASSWORD" });

  user.password = password;

  await user.save();

  await PasswordResetToken.findOneAndDelete({ owner: userId });

  sendPasswordSuccessEmail({
    name: user.name,
    email: user.email,
  });

  res.json({ message: " Password Reset Successfully." });
};

//TO SIGN IN
export const signIn: RequestHandler = async (req, res) => {
  const { password, email } = req.body;

  const user = await Users.findOne({
    email,
  });

  if (!user) return res.status(402).json({ error: "Email/Password mismatch" });

  //Now to compare password

  const matched = await user.comparePassword(password);
  if (!matched)
    return res.status(402).json({ error: "Email/Password mismatch" });

  //generate the token for later use

  const token = jwt.sign({ userId: user._id }, JWT_TOKEN);
  user.tokens.push(token);

  await user.save();

  res.json({
    profile: {
      id: user._id,
      name: user.name,
      email: user.email,
      verifyEmail: user.verified,
      avatar: user.avatar?.url,
      followers: user.followers.length,
      followings: user.followings.length,
    },
    token,
  });
};

//TO UPDATE PROFILES
export const updateProfile: RequestHandler = async (
  req: RequestWithFiles,
  res
) => {
  const { name } = req.body;

  const avatar = req.files?.avatar as formidable.File;

  const user = await Users.findById(req.user.id);

  if (!user) throw new Error("Something went wrong , user not found.");

  if (typeof name !== "string")
    return res.status(422).json({ error: "Invalid name!" });

  if (name.trim().length < 3)
    return res.status(422).json({ error: "Invalid name!" });

  user.name = name;

  if (avatar) {
    //if there is already an file we have to remove it

    if (user.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar?.publicId);
    }

    //upload new avatar file

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      avatar.filepath,
      {
        width: 300,
        height: 300,
        crop: "thumb",
        gravity: "face",
      }
    );

    user.avatar = { url: secure_url, publicId: public_id };
  }
  await user.save();

  res.json({ profile: formatProfile(user) });
};

//TO AUTHENTICATE THE USER
export const sendProfile: RequestHandler = (req, res) => {
  res.json({ profile: req.user });
};

//TO LOG_OUT THE USER
export const logOut: RequestHandler = async (req, res) => {
  const { fromAll } = req.query;

  const token = req.token;

  const user = await Users.findById(req.user.id);

  if (!user) throw new Error("something went wrong, user not found");

  if (fromAll === "yes") user.tokens = [];
  else user.tokens = user.tokens.filter((t) => t !== token);

  await user.save();

  res.json({ success: true });
};
