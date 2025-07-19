import mongoose, { Schema, Document } from "mongoose";
import { IRoom } from "../interfaces/room.js";

interface IRoomDocument extends IRoom, Document {}

const RoomSchema: Schema = new Schema({
  roomId: { type: String, required: true, unique: true },
  creator: { type: String, required: true },
  code: { type: String, default: "" },
  language: { type: String, default: "javascript" },
  createdAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
  }, // 24 hours
  users: [{ type: String, default: [] }],
});

export default mongoose.model<IRoomDocument>("Room", RoomSchema);
