export interface User {
  id: string;
  email: string;
  name?: string | null;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}
