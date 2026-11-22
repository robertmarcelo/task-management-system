import { User, AuthResponse } from "@/types/user";
import { Todo } from "@/types/todo";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "todo_auth_token";
const USER_KEY = "todo_auth_user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null): void {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

function getAuthHeaders(token?: string | null): Record<string, string> {
  const activeToken = token ?? getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (activeToken) {
    headers["Authorization"] = `Bearer ${activeToken}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = "An error occurred";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json();
}

// Authentication API
export async function registerApi(
  email: string,
  password: string,
  name?: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, name }),
  });

  return handleResponse<AuthResponse>(response);
}

export async function loginApi(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return handleResponse<AuthResponse>(response);
}

export async function getMeApi(token?: string | null): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  return handleResponse<User>(response);
}

// Todos API
export async function getTodos(
  token?: string | null,
  status?: string
): Promise<Todo[]> {
  const queryParam = status && status !== "all" ? `?status=${status}` : "";
  const response = await fetch(`${API_BASE_URL}/todos${queryParam}`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  return handleResponse<Todo[]>(response);
}

export async function createTodo(
  title: string,
  description: string,
  token?: string | null
): Promise<Todo> {
  const response = await fetch(`${API_BASE_URL}/todos`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ title, description: description || null }),
  });

  return handleResponse<Todo>(response);
}

export async function updateTodo(
  id: string | number,
  updates: {
    title?: string;
    description?: string | null;
    completed?: boolean;
  },
  token?: string | null
): Promise<Todo> {
  const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
    body: JSON.stringify(updates),
  });

  return handleResponse<Todo>(response);
}

export async function deleteTodo(
  id: string | number,
  token?: string | null
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });

  return handleResponse<void>(response);
}
