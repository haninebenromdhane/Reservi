import { apiFetch } from "./api";
import type { AuthResponse, RegisterResponse } from "@/types/auth";

export interface LoginData { email: string; password: string; }
export interface RegisterClientData { firstName: string; lastName: string; email: string; password: string; }
export interface RegisterAgentData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  professionId: string;
  city: string;
}

export const login = (data: LoginData) => apiFetch<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) });
export const registerClient = (data: RegisterClientData) => apiFetch<RegisterResponse>("/auth/register/client", { method: "POST", body: JSON.stringify(data) });
export const registerAgent = (data: RegisterAgentData) => apiFetch<RegisterResponse>("/auth/register/agent", { method: "POST", body: JSON.stringify(data) });
export const refresh = () => apiFetch<AuthResponse>("/auth/refresh", { method: "POST" });
export const getCurrentUser = (token: string) => apiFetch<AuthUser>("/auth/me", { token });

import type { AuthUser } from "@/types/auth";
