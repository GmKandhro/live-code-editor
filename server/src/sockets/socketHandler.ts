import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import Room from "../models/room";
import User from "../models/user.model";
import { ChatEventEnum } from "../constants";
import ErrorHandler from "../middlewares/errorHandler.middleware";
import { IUser } from "../interfaces/user";

interface AuthSocket extends Socket {
  user?: IUser;
}

const mountJoinRoomEvent = (socket: AuthSocket) => {
  socket.on(
    ChatEventEnum.JOIN_ROOM_EVENT,
    async ({ roomId }: { roomId: string }) => {
      const userId = socket.user?._id?.toString();
      if (!userId) {
        socket.emit(
          ChatEventEnum.SOCKET_ERROR_EVENT,
          new ErrorHandler("Unauthorized", 401).message
        );
        socket.disconnect();
        return;
      }

      socket.join(roomId);
      console.log(`User ${socket.id} (${userId}) joined room ${roomId}`);

      const room = await Room.findOne({ roomId });
      if (room) {
        if (!room.users.includes(userId)) {
          room.users.push(userId);
          await room.save();
          socket
            .to(roomId)
            .emit(ChatEventEnum.USER_UPDATE_EVENT, { users: room.users });
        }
        socket.emit(ChatEventEnum.INITIAL_CODE_EVENT, {
          code: room.code,
          language: room.language,
        });
      } else {
        socket.emit(
          ChatEventEnum.SOCKET_ERROR_EVENT,
          new ErrorHandler("Room not found", 400).message
        );
      }
    }
  );
};

const mountCodeUpdateEvent = (socket: AuthSocket) => {
  socket.on(
    ChatEventEnum.CODE_UPDATE_EVENT,
    async ({
      roomId,
      code,
      language,
    }: {
      roomId: string;
      code: string;
      language: string;
    }) => {
      try {
        const userId = socket.user?._id?.toString();
        if (!userId) {
          socket.emit(
            ChatEventEnum.SOCKET_ERROR_EVENT,
            new ErrorHandler("Unauthorized", 401).message
          );
          socket.disconnect();
          return;
        }

        const room = await Room.findOne({ roomId });
        if (!room || !room.users.includes(userId)) {
          socket.emit(
            ChatEventEnum.SOCKET_ERROR_EVENT,
            new ErrorHandler("User not in room or room not found", 403).message
          );
          socket.disconnect();
          return;
        }

        console.log(
          `Updating room ${roomId} with code: ${code}, language: ${language}`
        );
        await Room.updateOne({ roomId }, { code, language });
        socket
          .to(roomId)
          .emit(ChatEventEnum.CODE_UPDATE_EVENT, { code, language });
        console.log(`Broadcasted code update to room ${roomId}`);
      } catch (error) {
        console.error("Error in code update:", error);
        socket.emit(
          ChatEventEnum.SOCKET_ERROR_EVENT,
          new ErrorHandler("Error updating code", 500).message
        );
      }
    }
  );
};

const mountTypingEvents = (socket: AuthSocket) => {
  socket.on(ChatEventEnum.TYPING_EVENT, (roomId: string) => {
    socket
      .to(roomId)
      .emit(ChatEventEnum.TYPING_EVENT, { userId: socket.user?._id });
  });

  socket.on(ChatEventEnum.STOP_TYPING_EVENT, (roomId: string) => {
    socket
      .to(roomId)
      .emit(ChatEventEnum.STOP_TYPING_EVENT, { userId: socket.user?._id });
  });
};

export const initializeSocketIO = (io: Server): void => {
  io.use(async (socket: AuthSocket, next) => {
    try {
      const rawCookie = socket.handshake.headers?.cookie || "";
      const cookies = require("cookie").parse(rawCookie);
      console.log("Parsed cookies:", cookies);
      let token = cookies?.access_token || socket.handshake.auth?.token;
      if (!token) {
        return next(
          new ErrorHandler("Un-authorized handshake. Token is missing", 401)
        );
      }

      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret_key_here"
      ) as { userId: string };
      const userId = decodedToken.userId;

      const user: IUser | null = await User.findById(userId).select(
        "-password"
      );
      if (!user) {
        return next(
          new ErrorHandler("Un-authorized handshake. Token is invalid", 401)
        );
      }

      socket.user = user;
      if (user && user._id) {
        socket.join(user._id.toString());
      }
      next();
    } catch (error) {
      console.error("Socket auth error:", error);
      next(new ErrorHandler("Authentication error", 401));
    }
  });

  io.on("connection", (socket: AuthSocket) => {
    console.log(`User connected: ${socket.user?._id}`);

    socket.emit(ChatEventEnum.CONNECTED_EVENT);

    mountJoinRoomEvent(socket);
    mountCodeUpdateEvent(socket);
    mountTypingEvents(socket);

    socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
      if (socket.user?._id) {
        socket.leave(socket.user._id.toString());
        console.log(`User disconnected: ${socket.user._id}`);
      }
    });
  });
};

import { Request } from "express";

export const emitSocketEvent = (
  req: Request,
  roomId: string,
  event: string,
  payload: any
): void => {
  const io = req.app.get("io");
  if (!io) {
    console.error("Socket.IO not initialized");
    return;
  }
  io.to(roomId).emit(event, payload);
};
