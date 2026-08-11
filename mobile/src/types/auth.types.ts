export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  provider: 'LOCAL' | 'GOOGLE';
  timezone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  timezone?: string;
}
