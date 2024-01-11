import { Router } from "express";

import {
  create,
  generateForgetPasswordLink,
  grantAccess,
  logOut,
  sendProfile,
  sendReVerificationToken,
  signIn,
  updatePassword,
  updateProfile,
  verifyEmail,
} from "#/controllers/auth";
import { validate } from "#/middleware/validator";
import {
  CreateUserSchema,
  PasswordValidation,
  SignInValidationSchema,
  TokenAndIdValidation,
} from "#/utils/validationSchema";
import { isValidPassResetToken, mustAuth } from "#/middleware/auth";

import fileParser from "#/middleware/fileParser";

const router = Router();

router.post("/create", validate(CreateUserSchema), create);
router.post("/verify-email", validate(TokenAndIdValidation), verifyEmail);
router.post("/re-verify-email", sendReVerificationToken);
router.post("/forget-password", generateForgetPasswordLink);
router.post(
  "/verify-pass-reset-token",
  validate(TokenAndIdValidation),
  isValidPassResetToken,
  grantAccess
);
router.post(
  "/update-password",
  validate(PasswordValidation),
  isValidPassResetToken,
  updatePassword
);
router.post("/sign-in", validate(SignInValidationSchema), signIn);
router.post("/is-auth", mustAuth, sendProfile);

router.post("/update-profile", mustAuth, fileParser, updateProfile);
router.post("/log-out", mustAuth, logOut);

export default router;
