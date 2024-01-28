import { toggleFavorite } from "#/controllers/favorite";
import { isVerfied, mustAuth } from "#/middleware/auth";
import { Router } from "express";

const router = Router();

router.post("/", mustAuth, isVerfied, toggleFavorite);

export default router;
