/**
 * Servicio de Autenticación
 * Maneja login, registro, y gestión de usuarios
 */

import { apiClient } from "../client";
import type {
  AuthResponse,
  CreateRoleDTO,
  CreateUserDTO,
  LoginDTO,
  RoleDTO,
  UserDTO,
} from "../types";

export const authService = {
  // ============================================
  // Autenticación
  // ============================================

  /**
   * Iniciar sesión
   */
  async login(credentials: LoginDTO): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials,
    );

    // Guardar tokens en localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem(
        "user",
        JSON.stringify({
          userId: response.userId,
          email: response.email,
          name: response.name,
          roleId: response.roleId,
        }),
      );
    }

    return response;
  },

  /**
   * Refrescar token de acceso
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/refresh-token", {
      refreshToken,
    });
  },

  /**
   * Cerrar sesión
   */
  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  },

  /**
   * Obtener usuario actual desde localStorage
   */
  getCurrentUser(): UserDTO | null {
    if (typeof window === "undefined") return null;

    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("accessToken");
  },

  // ============================================
  // Usuarios
  // ============================================

  /**
   * Crear un nuevo usuario
   */
  async createUser(data: CreateUserDTO): Promise<UserDTO> {
    return apiClient.post<UserDTO>("/auth/users", data);
  },

  /**
   * Obtener usuario por ID
   */
  async getUserById(id: string): Promise<UserDTO> {
    return apiClient.get<UserDTO>(`/auth/users/${id}`);
  },

  /**
   * Obtener todos los usuarios
   */
  async getAllUsers(): Promise<UserDTO[]> {
    return apiClient.get<UserDTO[]>("/auth/users");
  },

  /**
   * Actualizar usuario
   */
  async updateUser(id: string, data: Partial<CreateUserDTO>): Promise<UserDTO> {
    return apiClient.put<UserDTO>(`/auth/users/${id}/update`, data);
  },

  /**
   * Eliminar usuario
   */
  async deleteUser(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/auth/users/${id}/delete`);
  },

  /**
   * Verificar si existe un usuario por email
   */
  async existsByEmail(email: string): Promise<boolean> {
    return apiClient.get<boolean>(`/auth/users/exists/email/${email}`);
  },

  /**
   * Verificar si existe un usuario por ID
   */
  async existsById(id: string): Promise<boolean> {
    return apiClient.get<boolean>(`/auth/users/exists/id/${id}`);
  },

  // ============================================
  // Roles
  // ============================================

  /**
   * Crear un nuevo rol
   */
  async createRole(data: CreateRoleDTO): Promise<RoleDTO> {
    return apiClient.post<RoleDTO>("/auth/roles", data);
  },

  /**
   * Obtener todos los roles
   */
  async getAllRoles(): Promise<RoleDTO[]> {
    return apiClient.get<RoleDTO[]>("/auth/roles");
  },

  /**
   * Obtener rol por ID
   */
  async getRoleById(id: string): Promise<RoleDTO> {
    return apiClient.get<RoleDTO>(`/auth/roles/${id}`);
  },

  /**
   * Actualizar rol
   */
  async updateRole(id: string, data: Partial<CreateRoleDTO>): Promise<RoleDTO> {
    return apiClient.put<RoleDTO>(`/auth/roles/${id}`, data);
  },

  /**
   * Eliminar rol
   */
  async deleteRole(id: string): Promise<void> {
    return apiClient.delete<void>(`/auth/roles/${id}`);
  },

  /**
   * Verificar si existe un rol por nombre
   */
  async roleExistsByName(name: string): Promise<boolean> {
    return apiClient.get<boolean>(`/auth/roles/exists/name/${name}`);
  },

  /**
   * Verificar si existe un rol por ID
   */
  async roleExistsById(id: string): Promise<boolean> {
    return apiClient.get<boolean>(`/auth/roles/exists/id/${id}`);
  },
};
