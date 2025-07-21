import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // console.log("", req.cookies, req.headers.Authorization);
  const token =
    req?.cookies?.token ||
    req?.cookies?.access_token ||
    req.headers.authorization?.split(" ")[1];
  // console.log("Token:", token);
  if (!token) {
    res.status(401).json({ message: "Plz loin to access" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key_here"
    ) as { userId: string };
    // console.log("Decoded token:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
