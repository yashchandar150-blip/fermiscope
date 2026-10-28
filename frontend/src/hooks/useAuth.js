import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Usage:  const { user, login, logout, isAdmin } = useAuth();
export default function useAuth() {
  return useContext(AuthContext);
}
