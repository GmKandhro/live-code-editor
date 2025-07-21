import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model";
import { errorHandler } from "../middlewares/errorHandler.middleware";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      res
        .status(400)
        .json({ message: "Email, password, and username are required" });
      return;
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const user = new userModel({ email, password, username });
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your_jwt_secret_key_here",
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({ token, userId: user._id, username: user.username });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error", error: (error as Error).message });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }
    const user = await userModel.findById(id).select("username");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error", error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await userModel.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your_jwt_secret_key_here",
      {
        expiresIn: "7d",
      }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
      })
      .setHeader("Authorization", `Bearer ${token}`)
      .status(200)
      .json({ token, userId: user._id, username: user.username });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error", error: (error as Error).message });
  }
};
