/**
 * Hook de autenticación personalizado
 * Facilita el uso de authService en componentes React
 */

"use client";

import { useState, useEffect } from "react";
import { authService, type UserDTO } from "@/lib/api";

export function useAuth() {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar autenticación al montar el componente
    const currentUser = authService.getCurrentUser();
    const authenticated = authService.isAuthenticated();

    setUser(currentUser);
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      const userData: UserDTO = {
        id: response.userId,
        email: response.email,
        name: response.name,
        roleId: response.roleId,
      };
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };
}
