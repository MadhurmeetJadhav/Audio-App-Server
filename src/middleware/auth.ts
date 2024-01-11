import passwordResetToken from "#/models/passwordResetToken";
import User from "#/models/users";
import { JWT_TOKEN } from "#/utils/variables";
import { RequestHandler } from "express";
import { JwtPayload, verify } from "jsonwebtoken";

export const isValidPassResetToken: RequestHandler = async (req, res, next) => {
  const { token, userId } = req.body;

  const resetToken = await passwordResetToken.findOne({
    owner: userId,
  });

  if (!resetToken)
    return res
      .status(403)
      .json({ error: "Unauthorized access, invalid token." });

  const matched = await resetToken.compareToken(token);
  if (!matched) return res.status(403).json({ error: "Invalid Token." });

  next();
};

export const mustAuth: RequestHandler = async (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization?.split("Bearer ")[1];
  if (!token) return res.status(403).json({ error: "Unauthorized request" });

  const verifiedToken = verify(token, JWT_TOKEN);
  console.log(verifiedToken);
  const { userId } = verifiedToken as JwtPayload;
  const user = await User.findOne({ _id: userId, tokens: token });

  if (!user) return res.status(403).json({ error: "Unauthorized request" });

  req.user = {
    id: user._id,
    name: user.name,
    email: user.email,
    verifyEmail: user.verified,
    avatar: user.avatar?.url,
    followers: user.followers.length,
    followings: user.followings.length,
  };
  req.token = token;

  next();
};
