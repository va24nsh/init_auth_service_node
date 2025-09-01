import { Router } from "express";
import { Auth } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post('/generate', authenticate, Auth.generateTokens);
router.post('/verify', authenticate, authenticate, Auth.verifyTokens);
router.post('/refresh', authenticate, Auth.refreshTokens);

export default router;
