export interface IRoom {
  roomId: string;
  creator: string;
  code: string;
  language: string;
  createdAt: Date;
  expiresAt: Date;
  users: string[];
}
