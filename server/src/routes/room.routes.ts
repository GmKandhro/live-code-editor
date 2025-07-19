import { Router } from "express";
import {
  createRoom,
  deleteRoom,
  joinRoom,
  listRooms,
  updateRoomCode,
} from "../controllers/room.controller";
import { authMiddleware } from "../middlewares/auth.moddleware";

const router = Router();

router.post("/create", authMiddleware, createRoom);
router.post("/join/:roomId", authMiddleware, joinRoom);
router.put("/:roomId/code", authMiddleware, updateRoomCode);
router.get("/", authMiddleware, listRooms);
router.delete("/:roomId", authMiddleware, deleteRoom);

export default router;
