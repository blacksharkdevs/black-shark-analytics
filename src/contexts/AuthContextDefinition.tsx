import { createContext } from "react";

interface User {
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  registerUser: (
    name: string,
    email: string,
    password: string,
    role?: "ADMIN" | "USER"
  ) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
