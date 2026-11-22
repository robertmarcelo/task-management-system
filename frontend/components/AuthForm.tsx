"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AuthForm() {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setSubmitting(true);
    try {
      if (isRegisterMode) {
        await register(email.trim(), password, name.trim() || undefined);
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function toggleMode() {
    setIsRegisterMode(!isRegisterMode);
    setError("");
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {isRegisterMode ? "Create an Account" : "Sign In to Your Account"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isRegisterMode
            ? "Sign up to start organizing and managing your tasks"
            : "Enter your credentials to access your personal tasks"}
        </p>
      </div>

      <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => {
            setIsRegisterMode(false);
            setError("");
          }}
          className={`w-1/2 rounded-md py-2 text-sm font-medium transition-colors ${
            !isRegisterMode
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setIsRegisterMode(true);
            setError("");
          }}
          className={`w-1/2 rounded-md py-2 text-sm font-medium transition-colors ${
            isRegisterMode
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Register
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegisterMode && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Full Name (Optional)
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Must be at least 6 characters
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? isRegisterMode
              ? "Creating Account..."
              : "Signing In..."
            : isRegisterMode
              ? "Create Account"
              : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {isRegisterMode ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={toggleMode}
          className="font-medium text-blue-600 hover:underline"
        >
          {isRegisterMode ? "Sign in" : "Sign up"}
        </button>
      </p>
    </div>
  );
}
