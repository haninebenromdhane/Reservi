export type UserRole = "CLIENT" | "AGENT" | "ADMIN";

export type UserStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  avatarUrl?: string;
  phone?: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type RegisterResponse = AuthResponse | {
  message: string;
  user: AuthUser;
};
export type LoginResponse = AuthResponse;
