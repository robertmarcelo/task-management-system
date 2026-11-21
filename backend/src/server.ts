import "dotenv/config";
import express from "express";
import cors from "cors";
import { Prisma } from "./generated/prisma/client";
import { prisma } from "./database/prisma";


const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Task Management API is running!");
});




 

app.get("/api/todos", async (req, res) => {
  try {
    const status = req.query.status;

    // Validate the status query parameter
    if (
      status !== undefined &&
      status !== "completed" &&
      status !== "pending"
    ) {
      return res.status(400).json({
        message: "Status must be completed or pending",
      });
    }

    // Build the filter
    const where =
      status === "completed"
        ? { completed: true }
        : status === "pending"
        ? { completed: false }
        : {};

    const todos = await prisma.todo.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);

    res.status(500).json({
      message: "Failed to retrieve todos",
    });
  }
});



app.post("/api/todos", async (req, res) => {
  try {
    const { title, description } = req.body;

    // Validate the title
    if (
      typeof title !== "string" ||
      title.trim() === ""
    ) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    // Create the Todo in PostgreSQL
    const newTodo = await prisma.todo.create({
      data: {
        title: title.trim(),
        description,
      },
    });

    // Return the newly created Todo
    return res.status(201).json(newTodo);

  } catch (error) {
    console.error("Error creating todo:", error);

    return res.status(500).json({
      message: "Failed to create todo",
    });
  }
});



app.patch("/api/todos/:id", async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    const id = req.params.id;

    // Validate title if provided
    if (
      title !== undefined &&
      (typeof title !== "string" || title.trim() === "")
    ) {
      return res.status(400).json({
        message: "Title must be a non-empty string",
      });
    }

    // Validate description if provided
    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        message: "Description must be a string or null",
      });
    }

    // Validate completed if provided
    if (
      completed !== undefined &&
      typeof completed !== "boolean"
    ) {
      return res.status(400).json({
        message: "Completed must be a boolean",
      });
    }

    // Ensure at least one field is provided
    if (
      title === undefined &&
      description === undefined &&
      completed === undefined
    ) {
      return res.status(400).json({
        message: "At least one field is required to update",
      });
    }


    // Update Todo
    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description }),
        ...(completed !== undefined && { completed }),
      },
    });

    res.json(updatedTodo);
    } catch (error) {
    console.error("Error updating todo:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    return res.status(500).json({
      message: "Failed to update todo",
    });
  }
});

app.delete("/api/todos/:id", async (req, res) => {
  try {
    const id = req.params.id;


    await prisma.todo.delete({
      where: { id },
    });

    return res.status(204).send();

    } catch (error) {
    console.error("Error deleting todo:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    return res.status(500).json({
      message: "Failed to delete todo",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});