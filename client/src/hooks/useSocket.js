import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Cookies from "js-cookie";
import { ChatEventEnum } from "../constants";

export const useSocket = (roomId, events) => {
  const socketRef = useRef(null);

  console.log(
    "useSocket initialized with roomId:",
    roomId,
    "and events:",
    events
  );

  useEffect(() => {
    if (!roomId) return;

    console.log("Connecting to Socket.IO at:", import.meta.env.VITE_SOCKET_URL);

    const token = Cookies.get("access_token");
    console.log("Token:", token);

    if (!token) {
      console.error("No access token found, connection will likely fail");
    }

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      auth: {
        token: token || "",
        userId: Cookies.get("userId"),
        username: Cookies.get("username"),
      },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected");
      socketRef.current.emit(ChatEventEnum.JOIN_ROOM_EVENT, { roomId });
      socketRef.current.emit(ChatEventEnum.USER_UPDATE_EVENT, {
        roomId,
        users: [
          { userId: Cookies.get("userId"), username: Cookies.get("username") },
        ],
      });
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socketRef.current.on(ChatEventEnum.CONNECTED_EVENT, () => {
      console.log("Received connected event");
    });

    socketRef.current.on(ChatEventEnum.SOCKET_ERROR_EVENT, (err) => {
      console.error("Socket error:", err);
      events.onError(err);
    });

    socketRef.current.on(
      ChatEventEnum.INITIAL_CODE_EVENT,
      events.onInitialCode
    );
    socketRef.current.on(ChatEventEnum.CODE_UPDATE_EVENT, events.onCodeUpdate);
    socketRef.current.on(ChatEventEnum.USER_UPDATE_EVENT, events.onUserUpdate);
    socketRef.current.on(
      ChatEventEnum.ROOM_DELETED_EVENT,
      events.onRoomDeleted
    );
    socketRef.current.on(ChatEventEnum.TYPING_EVENT, events.onTyping);
    socketRef.current.on(ChatEventEnum.STOP_TYPING_EVENT, events.onStopTyping);
    socketRef.current.on("chatMessage", events.onChatMessage);

    return () => {
      console.log("Disconnecting socket");
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  const emitCodeUpdate = (code, language) => {
    socketRef.current?.emit(ChatEventEnum.CODE_UPDATE_EVENT, {
      roomId,
      code,
      language,
    });
  };

  const emitTyping = () => {
    socketRef.current?.emit(ChatEventEnum.TYPING_EVENT, roomId);
  };

  const emitStopTyping = () => {
    socketRef.current?.emit(ChatEventEnum.STOP_TYPING_EVENT, roomId);
  };

  const emitChatMessage = ({ message, recipientId }) => {
    socketRef.current?.emit("chatMessage", {
      roomId,
      message,
      username: Cookies.get("username") || "",
      recipientId,
      senderId: Cookies.get("userId") || "", // Fixed case to match prop
    });
    // Emit user update to refresh the user list
    socketRef.current.emit(ChatEventEnum.USER_UPDATE_EVENT, {
      roomId,
      users: [
        { userId: Cookies.get("userId"), username: Cookies.get("username") },
      ],
    });
  };

  return {
    emitCodeUpdate,
    emitTyping,
    emitStopTyping,
    emitChatMessage,
  };
};
