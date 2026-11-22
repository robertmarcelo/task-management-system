
import "dotenv/config";
import express from "express";
import cors from "cors";
import todoRoutes from "./routes/todo.routes";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Task Management API is running!");
});

// Todo routes
app.use("/api/todos", todoRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
