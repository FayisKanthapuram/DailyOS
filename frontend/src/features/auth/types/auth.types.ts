export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  provider: 'LOCAL' | 'GOOGLE';
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
}

export interface LoginPayload {
  email: string;
  password: string;
}
