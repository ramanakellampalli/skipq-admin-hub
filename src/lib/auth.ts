import { create } from "zustand";

interface AuthState {
  token: string | null;
  user: { email: string; name: string } | null;
  login: (token: string, user: { email: string; name: string }) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuth = create<AuthState>((set) => {
  const token = localStorage.getItem("skipq_token");
  const user = localStorage.getItem("skipq_user");
  return {
    token,
    user: user ? JSON.parse(user) : null,
    isAuthenticated: !!token,
    login: (token, user) => {
      localStorage.setItem("skipq_token", token);
      localStorage.setItem("skipq_user", JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem("skipq_token");
      localStorage.removeItem("skipq_user");
      set({ token: null, user: null, isAuthenticated: false });
    },
  };
});
