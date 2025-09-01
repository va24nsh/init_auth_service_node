import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class Auth {
  static async generateTokens(req: Request, res: Response) {
    const { userId, email } = req.body;
    try {
      const tokens = await AuthService.generateTokens({ userId, email });
      res.status(200).json({ tokens, message: "Tokens generated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async verifyTokens(req: Request, res: Response) {
    const { accessToken, refreshToken } = req.cookies;
    try {
      const userData = await AuthService.verifyTokens({ accessToken, refreshToken });
      res.status(200).json({ user: userData, message: "Tokens are valid" });
    } catch (error) {
      res.status(401).json({ message: "Unauthorized" });
    }
  }

  static async refreshTokens(req: Request, res: Response) {
    const { refreshToken } = req.cookies;
    try {
      const tokens = await AuthService.refresh(refreshToken);
      res.status(200).json({ tokens, message: "Tokens refreshed successfully" });
    } catch (error) {
      res.status(401).json({ message: "Unauthorized" });
    }
  }
}
