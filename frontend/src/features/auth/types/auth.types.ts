export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  provider: 'LOCAL' | 'GOOGLE';
  timezone?: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  timezone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
