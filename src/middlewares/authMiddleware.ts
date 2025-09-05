import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { access_token, refresh_token } = req.cookies;
  if (!access_token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const payload = jwt.verify(access_token, process.env.API_GATEWAY_KEY!) as { id: string; };
    if (!payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  } catch (err) {
    return res.status(403).json({ message: "Forbidden" });
  }
};
