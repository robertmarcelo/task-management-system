"use client";

import { useState, useEffect } from "react";
import { getTodos, createTodo, updateTodo, deleteTodo } from "@/lib/api";
import type { Todo } from "@/types/todo";




export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  
  const [editingId, setEditingId] = useState<string | number | null>(null);
const [editTitle, setEditTitle] = useState("");
const [editDescription, setEditDescription] = useState("");

useEffect(() => {
  async function loadTodos() {
    try {
      const data = await getTodos();
      setTodos(data);
    } catch (error) {
  console.error("Error loading todos:", error);
  setError("Failed to load tasks. Please try again.");
} finally {
  setLoading(false);
}
  }

  loadTodos();
}, []);

 async function addTodo(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  if (title.trim() === "" || submitting) {
    return;
  }

  setSubmitting(true);

  try {
    const newTodo = await createTodo(title.trim(), description.trim());

    setTodos((previousTodos) => [newTodo, ...previousTodos]);

    setTitle("");
    setDescription("");
  } catch (error) {
    console.error("Error creating todo:", error);
    alert("Failed to save task. Please try again.");
  } finally {
    setSubmitting(false);
  }
}


  async function toggleTodo(id: string | number) {
  const todoToUpdate = todos.find((todo) => todo.id === id);

  if (!todoToUpdate) return;

  const updatedCompleted = !todoToUpdate.completed;

  try {
    await updateTodo(id, { completed: updatedCompleted });

    setTodos((previousTodos) =>
      previousTodos.map((todo) =>
        todo.id === id
          ? { ...todo, completed: updatedCompleted }
          : todo
      )
    );
  } catch (error) {
    console.error("Error updating todo:", error);
    alert("Failed to update task status.");
  }
}

  async function handleDeleteTodo(id: string | number) {
  try {
    await deleteTodo(id);

    setTodos((previousTodos) =>
      previousTodos.filter((todo) => todo.id !== id)
    );
  } catch (error) {
    console.error("Error deleting todo:", error);
    alert("Failed to delete task. Please try again.");
  }
}


function startEditing(todo: Todo) {
  setEditingId(todo.id);
  setEditTitle(todo.title);
  setEditDescription(todo.description || "");
}

function cancelEditing() {
  setEditingId(null);
  setEditTitle("");
  setEditDescription("");
}

async function saveEdit(id: string | number) {
  if (editTitle.trim() === "" || savingEdit) {
    return;
  }

  setSavingEdit(true);

  const updates = {
    title: editTitle.trim(),
    description: editDescription.trim() || null,
  };

  try {
    const updatedTodo = await updateTodo(id, updates);

    setTodos((previousTodos) =>
      previousTodos.map((todo) =>
        todo.id === id ? updatedTodo : todo
      )
    );

    cancelEditing();
  } catch (error) {
    console.error("Error editing todo:", error);
    alert("Failed to save changes. Please try again.");
  } finally {
    setSavingEdit(false);
  }
}

  const filteredTodos = todos.filter((todo) => {
    if (filter === "completed") return todo.completed;
    if (filter === "pending") return !todo.completed;
    return true;
  });

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Todo List
          </h1>
          <p className="mt-2 text-gray-500">
            Keep track of your tasks and get things done.
          </p>
        </header>

        {/* Add Todo Form */}
        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Add a new task
          </h2>

          <form onSubmit={addTodo} className="space-y-4">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <textarea
              placeholder="Description (optional)"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <button
  type="submit"
  disabled={submitting}
  className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
>
  {submitting ? "Saving..." : "+ Add Task"}
</button>
          </form>
        </section>

        {/* Todo List */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Your Tasks
            </h2>
            <span className="text-sm text-gray-500">
              {todos.length} tasks
            </span>
          </div>

          {/* Filters */}
          <div className="mb-5 flex gap-2">
            {["all", "pending", "completed"].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`rounded-lg px-4 py-2 text-sm capitalize ${
                  filter === filterOption
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filterOption}
              </button>
            ))}
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {error && (
  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
    {error}
  </p>
)}
            {loading ? (
  <p className="py-10 text-center text-gray-500">
    Loading tasks...
  </p>
) : filteredTodos.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 py-10 text-center">
                <p className="text-gray-500">No tasks to display.</p>
                <p className="mt-1 text-sm text-gray-400">
                  Add a task above to get started.
                </p>
              </div>
            ) : (
              
filteredTodos.map((todo) => (
  <div
    key={todo.id}
    className="flex items-start justify-between rounded-lg border border-gray-200 p-4"
  >
    {editingId === todo.id ? (
      <div className="flex-1 space-y-3">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="Task title"
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
        />

        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="Task description"
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
          rows={2}
        />

        <div className="flex gap-2">
          <button
  onClick={() => saveEdit(todo.id)}
  disabled={savingEdit}
  className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
>
  {savingEdit ? "Saving..." : "Save"}
</button>

          <button
            onClick={cancelEditing}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    ) : (
      <>
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
            className="mt-1 h-4 w-4"
          />

          <div>
            <h3
              className={`font-medium ${
                todo.completed
                  ? "text-gray-400 line-through"
                  : "text-gray-800"
              }`}
            >
              {todo.title}
            </h3>

            {todo.description && (
              <p className="mt-1 text-sm text-gray-500">
                {todo.description}
              </p>
            )}

            <p className="mt-2 text-xs text-gray-400">
              {todo.completed ? "Completed" : "Pending"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => startEditing(todo)}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Edit
          </button>

          <button
            onClick={() => handleDeleteTodo(todo.id)}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      </>
    )}
  </div>
))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}