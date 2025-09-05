import { Router } from "express";
import { Auth } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post('/generate', Auth.generateTokens);
router.post('/verify', authenticate, Auth.verifyTokens);
router.post('/refresh', Auth.refreshTokens);

export default router;
