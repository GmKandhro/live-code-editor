import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Cookies from "js-cookie";
import { ChatEventEnum } from "../constants";

export const useSocket = (roomId, events) => {
  const socketRef = useRef(null);
  console.log("cookies", Cookies.get("token"));
  useEffect(() => {
    if (!roomId) return;
    console.log(
      "Connecting to socket for room:",
      roomId,
      import.meta.env.VITE_SOCKET_URL
    );
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token: Cookies.get("access_token") },
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current.on(ChatEventEnum.CONNECTED_EVENT, () => {
      console.log("Socket connected");
      socketRef.current.emit(ChatEventEnum.JOIN_ROOM_EVENT, { roomId });
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
    socketRef.current.on(ChatEventEnum.SOCKET_ERROR_EVENT, events.onError);

    return () => {
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

  return { emitCodeUpdate, emitTyping, emitStopTyping };
};
