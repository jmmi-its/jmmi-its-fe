export interface AdminModel {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  access_token: string;
  refresh_token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  access_token: string;
  refresh_token: string;
}

export interface VerifyTokenPayload {
  adminId: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  status: boolean;
  message: string;
  data?: LoginResponse;
  error?: string;
}
