import { Request, Response } from "express";
import Room from "../models/room";
import { v4 as uuidv4 } from "uuid";
import { ChatEventEnum } from "../constants";
import { emitSocketEvent } from "../sockets/socketHandler";
import ErrorHandler from "../middlewares/errorHandler.middleware";

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const createRoom = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    console.log("hello");
    const { language } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      throw new ErrorHandler("Unauthorized", 401);
    }
    if (!language) {
      throw new ErrorHandler("Language is required", 400);
    }

    const roomId = uuidv4();
    const room = new Room({
      roomId,
      creator: userId,
      language,
      code: "",
      users: [userId],
    });

    await room.save();
    emitSocketEvent(req, userId, ChatEventEnum.ROOM_CREATED_EVENT, {
      roomId,
      creator: userId,
      language,
    });
    res.status(201).json({ roomId, message: "Room created successfully" });
  } catch (error) {
    const err =
      error instanceof ErrorHandler
        ? error
        : new ErrorHandler("Server error", 500);
    res.status(err.statusCode).json({
      message: err.message,
      error: error instanceof Error ? error.message : undefined,
    });
  }
};

export const joinRoom = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      throw new ErrorHandler("Unauthorized", 401);
    }

    const room = await Room.findOne({ roomId });
    if (!room) {
      throw new ErrorHandler("Room not found", 400);
    }

    if (!room.users.includes(userId)) {
      room.users.push(userId);
      await room.save();
      emitSocketEvent(req, roomId, ChatEventEnum.USER_UPDATE_EVENT, {
        users: room.users,
      });
    }

    emitSocketEvent(req, roomId, ChatEventEnum.INITIAL_CODE_EVENT, {
      code: room.code,
      language: room.language,
    });
    res.status(200).json({
      roomId: room.roomId,
      code: room.code,
      language: room.language,
      users: room.users,
    });
  } catch (error) {
    const err =
      error instanceof ErrorHandler
        ? error
        : new ErrorHandler("Server error", 500);
    res.status(err.statusCode).json({
      message: err.message,
      error: error instanceof Error ? error.message : undefined,
    });
  }
};

export const updateRoomCode = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { roomId } = req.params;
    const { code, language } = req.body;
    console.log("update");
    const userId = req.user?.userId;
    if (!userId) {
      throw new ErrorHandler("Unauthorized", 401);
    }
    if (!code || !language) {
      throw new ErrorHandler("Code and language are required", 400);
    }

    const room = await Room.findOne({ roomId });
    if (!room) {
      throw new ErrorHandler("Room not found", 400);
    }

    if (!room.users.includes(userId)) {
      throw new ErrorHandler("User not in room", 403);
    }

    room.code = code;
    room.language = language;
    await room.save();

    emitSocketEvent(req, roomId, ChatEventEnum.CODE_UPDATE_EVENT, {
      code,
      language,
    });
    res.status(200).json({ message: "Code updated successfully" });
  } catch (error) {
    const err =
      error instanceof ErrorHandler
        ? error
        : new ErrorHandler("Server error", 500);
    res.status(err.statusCode).json({
      message: err.message,
      error: error instanceof Error ? error.message : undefined,
    });
  }
};

export const listRooms = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new ErrorHandler("Unauthorized", 401);
    }

    const rooms = await Room.find().populate("users", "userId");

    res.status(200).json(rooms);
  } catch (error) {
    const err =
      error instanceof ErrorHandler
        ? error
        : new ErrorHandler("Server error", 500);
    res.status(err.statusCode).json({
      message: err.message,
      error: error instanceof Error ? error.message : undefined,
    });
  }
};

export const deleteRoom = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { roomId } = req.params;
    const creatorId = req.user?.userId;
    if (!creatorId) {
      throw new ErrorHandler("Unauthorized", 401);
    }

    const room = await Room.findOne({ roomId });
    if (!room) {
      throw new ErrorHandler("Room not found", 400);
    }

    if (room.creator !== creatorId) {
      throw new ErrorHandler("Only the creator can delete the room", 403);
    }

    await Room.deleteOne({ roomId });
    emitSocketEvent(req, roomId, ChatEventEnum.ROOM_DELETED_EVENT, { roomId });
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    const err =
      error instanceof ErrorHandler
        ? error
        : new ErrorHandler("Server error", 500);
    res.status(err.statusCode).json({
      message: err.message,
      error: error instanceof Error ? error.message : undefined,
    });
  }
};
