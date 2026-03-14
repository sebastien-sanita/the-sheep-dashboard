import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser, AuthResponse } from "../types";

const STORAGE_KEY = "the-sheep-auth";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;

  login: (response: AuthResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (response) =>
        set({
          token: response.accessToken,
          user: response.user,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: STORAGE_KEY,
    },
  ),
);
