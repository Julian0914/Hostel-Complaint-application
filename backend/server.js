require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/student");
const adminRoutes = require("./routes/admin");
const staffRoutes = require("./routes/staff");

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin || allowedOrigins.length === 0) {
    return true;
  }

  return allowedOrigins.includes(origin);
};

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin blocked"));
    },
    credentials: true,
  },
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin blocked"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.set("io", io);

app.use("/api/auth", authRoutes);
app.use("/api/student/complaints", studentRoutes);
app.use("/api/admin/complaints", adminRoutes);
app.use("/api/staff/complaints", staffRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(userId);
    }
  });

  socket.on("disconnect", () => {});
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message || "Internal server error." });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
