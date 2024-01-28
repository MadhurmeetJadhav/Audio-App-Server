import { createAudio, updateAudio } from "#/controllers/audio";
import { isVerfied, mustAuth } from "#/middleware/auth";
import fileParser from "#/middleware/fileParser";
import { validate } from "#/middleware/validator";
import { AudioValidationSchema } from "#/utils/validationSchema";
import { Router } from "express";

const router = Router();

router.post(
  "/create",
  mustAuth,
  isVerfied,
  fileParser,
  validate(AudioValidationSchema),
  createAudio
);
router.patch(
  "/:audioId",
  mustAuth,
  isVerfied,
  fileParser,
  validate(AudioValidationSchema),
  updateAudio
);

export default router;
