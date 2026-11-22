
import { Router } from "express";
import { z } from "zod";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../database/prisma";

const router = Router();

// Zod validation schemas
const createTodoSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().nullable().optional(),
});

const updateTodoSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title must be a non-empty string")
      .optional(),
    description: z.string().nullable().optional(),
    completed: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.completed !== undefined,
    {
      message: "At least one field is required to update",
    }
  );

// GET all Todos with filtering and pagination
router.get("/", async (req, res) => {
  try {
    const status = req.query.status;

    // Validate status
    if (
      status !== undefined &&
      status !== "completed" &&
      status !== "pending"
    ) {
      return res.status(400).json({
        message: "Status must be completed or pending",
      });
    }

    // Validate pagination
    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        message: "Page must be at least 1 and limit must be between 1 and 100",
      });
    }

    const skip = (page - 1) * limit;

    // Build the filter
    const where =
      status === "completed"
        ? { completed: true }
        : status === "pending"
          ? { completed: false }
          : {};

    // Fetch Todos and total count
    const [todos, total] = await Promise.all([
      prisma.todo.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.todo.count({ where }),
    ]);

    // Pagination metadata in response headers
    res.set("X-Total-Count", String(total));
    res.set("X-Page", String(page));
    res.set("X-Limit", String(limit));
    res.set("X-Total-Pages", String(Math.ceil(total / limit)));

    return res.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);

    return res.status(500).json({
      message: "Failed to retrieve todos",
    });
  }
});

// POST create a Todo
router.post("/", async (req, res) => {
  try {
    const result = createTodoSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: result.error.issues[0].message,
      });
    }

    const { title, description } = result.data;

    const newTodo = await prisma.todo.create({
      data: {
        title: title.trim(),
        description,
      },
    });

    return res.status(201).json(newTodo);
  } catch (error) {
    console.error("Error creating todo:", error);

    return res.status(500).json({
      message: "Failed to create todo",
    });
  }
});

// PATCH update a Todo
router.patch("/:id", async (req, res) => {
  try {
    const result = updateTodoSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: result.error.issues[0].message,
      });
    }

    const { title, description, completed } = result.data;
    const id = req.params.id;

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description }),
        ...(completed !== undefined && { completed }),
      },
    });

    return res.json(updatedTodo);
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

// DELETE a Todo
router.delete("/:id", async (req, res) => {
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

export default router;
