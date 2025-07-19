import express, { Application } from "express";
import { Server } from "socket.io";
import http, { createServer } from "http";
import cors from "cors";
import { initializeSocketIO } from "./sockets/socketHandler";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swaggerConf";
import cookieParser from "cookie-parser";

// import routers
import roomRoutes from "./routes/room.routes";
import authRoutes from "./routes/user.routes";

const app: Application = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for testing
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("Welcome to the Live Code Editor API");
});
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
// app.locals.io = io; // Store io in app.locals for controllers
// initializeSocketIO(io);
app.locals.io = io;
app.set("io", io);
initializeSocketIO(io);
app.use(errorHandler);

export { app, server };
