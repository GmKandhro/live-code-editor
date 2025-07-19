import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = async (data) => {
  const response = await api.post("/api/auth/register", data);
  Cookies.set("access_token", response.data.token, { expires: 7 });
  Cookies.set("userId", response.data.userId, { expires: 7 });
  return response.data;
};

export const login = async (data) => {
  const response = await api.post("/api/auth/login", data);
  Cookies.set("access_token", response.data.token, { expires: 7 });
  Cookies.set("userId", response.data.userId, { expires: 7 });
  return response.data;
};

export const createRoom = async (language) => {
  const response = await api.post("/api/rooms/create", { language });
  return response.data;
};

export const joinRoom = async (roomId) => {
  const response = await api.post(`/api/rooms/join/${roomId}`);
  return response.data;
};

export const updateRoomCode = async (roomId, code, language) => {
  const response = await api.put(`/api/rooms/${roomId}/code`, {
    code,
    language,
  });
  return response.data;
};

export const listRooms = async () => {
  const response = await api.get("/api/rooms");
  return response.data;
};

export const deleteRoom = async (roomId) => {
  const response = await api.delete(`/api/rooms/${roomId}`);
  return response.data;
};

export const logout = () => {
  Cookies.remove("access_token");
  Cookies.remove("userId");
};
