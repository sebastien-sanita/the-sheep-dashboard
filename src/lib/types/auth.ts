// ============================================================
// Auth types — JWT authentication
// ============================================================

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  workspaceId: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
