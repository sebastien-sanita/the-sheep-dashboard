import type { LoginPayload, AuthResponse } from "../types";
import { apiPost } from "./client";

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiPost<AuthResponse>("/api/auth/login", payload);
}
