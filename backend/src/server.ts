import "dotenv/config";
import express from "express";
import cors from "cors";
import { z } from "zod";
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

const createTodoSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().nullable().optional(),
});
const updateTodoSchema = z.object({
  title: z.string().trim().min(1, "Title must be a non-empty string").optional(),
  description: z.string().nullable().optional(),
  completed: z.boolean().optional(),
}).refine(
  (data) =>
    data.title !== undefined ||
    data.description !== undefined ||
    data.completed !== undefined,
  {
    message: "At least one field is required to update",
  }
);
app.post("/api/todos", async (req, res) => {
  try {
    const result = createTodoSchema.safeParse(req.body);

if (!result.success) {
  return res.status(400).json({
    message: result.error.issues[0].message,
  });
}

const { title, description } = result.data;

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
    const result = updateTodoSchema.safeParse(req.body);

if (!result.success) {
  return res.status(400).json({
    message: result.error.issues[0].message,
  });
}

const { title, description, completed } = result.data;
const id = req.params.id;


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