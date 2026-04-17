import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { ensureDefaultColleges } from "./utils/colleges.js";

dotenv.config();

const configuredPort = parseInt(process.env.PORT, 10);
const defaultPort = Number.isNaN(configuredPort) ? 5000 : configuredPort;
const httpServer = createServer(app);
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://127.0.0.1:5173",
  "http://localhost:5173",
].filter(Boolean);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Track active users
const activeUsers = new Map();

app.set("socketio", io);
app.set("activeUsers", activeUsers);

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // User comes online
  socket.on("user-online", (userId) => {
    activeUsers.set(userId, socket.id);
    io.emit("user-status-change", { userId, online: true });
  });

  // Handle new message
  socket.on("send-message", (data) => {
    const { senderId, recipientId, message, listing } = data;

    // Send to recipient if online
    const recipientSocketId = activeUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("new-message", {
        sender: senderId,
        recipient: recipientId,
        message,
        listing,
        timestamp: new Date(),
      });
    }

    // Also emit to sender for confirmation
    socket.emit("message-sent", {
      recipient: recipientId,
      message,
    });
  });

  // Handle typing indicator
  socket.on("user-typing", (data) => {
    const { senderId, recipientId } = data;
    const recipientSocketId = activeUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("user-typing", { userId: senderId });
    }
  });

  socket.on("stop-typing", (data) => {
    const { senderId, recipientId } = data;
    const recipientSocketId = activeUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("stop-typing", { userId: senderId });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (let [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        io.emit("user-status-change", { userId, online: false });
        break;
      }
    }
  });
});

function startServer(portToUse) {
  return new Promise((resolve, reject) => {
    const onError = (err) => {
      httpServer.off("error", onError);
      reject(err);
    };

    httpServer.once("error", onError);
    httpServer.listen(portToUse, () => {
      httpServer.off("error", onError);
      resolve(portToUse);
    });
  });
}

async function findAvailablePort(startPort, maxPort) {
  for (let candidate = startPort; candidate <= maxPort; candidate += 1) {
    try {
      if (candidate !== startPort) {
        console.warn(
          `Port ${candidate - 1} is busy. Trying port ${candidate}...`,
        );
      }
      return await startServer(candidate);
    } catch (error) {
      if (error.code !== "EADDRINUSE") {
        throw error;
      }
      if (candidate === maxPort) {
        throw error;
      }
    }
  }
}

connectDatabase()
  .then(() => ensureDefaultColleges())
  .then(async () => {
    try {
      const portToUse = await findAvailablePort(defaultPort, defaultPort + 10);
      console.log(`Server running on http://localhost:${portToUse}`);
      console.log(`Socket.io server ready for real-time communication`);
    } catch (error) {
      console.error("Failed to start server", error);
      console.error(
        "Please free a port between 5000 and 5010, or set PORT in your .env to a port that is available.",
      );
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("Failed to initialize server", error);
    process.exit(1);
  });
