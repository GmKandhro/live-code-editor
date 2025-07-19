import dotenv from "dotenv";
import connectDB from "./config/db";
import { app, server } from "./app";

dotenv.config();

const PORT = process.env.PORT || 5000;
console.log(`Server is running on port ${PORT}`);
const startServer = async (): Promise<void> => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
