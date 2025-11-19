/**
 * API Client Configuration
 * Cliente HTTP centralizado para comunicarse con el backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface RequestOptions extends RequestInit {
  headers?: HeadersInit;
}

/**
 * Cliente API con manejo de autenticación y errores
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Obtiene los headers por defecto incluyendo el token de autenticación
   */
  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Agregar token de autenticación si existe (solo en cliente)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Realiza una petición HTTP
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestOptions = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Si no es exitoso, intentar parsear el error
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: response.statusText,
        }));

        // Si es 401, el token expiró
        if (response.status === 401 && typeof window !== "undefined") {
          // Intentar refrescar el token
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Reintentar la petición original
            return this.request<T>(endpoint, options);
          } else {
            // Redirigir al login
            localStorage.clear();
            window.location.href = "/login";
          }
        }

        throw new Error(errorData.message || `HTTP Error ${response.status}`);
      }

      // Si la respuesta está vacía (204 No Content), retornar null
      if (response.status === 204) {
        return null as T;
      }

      return response.json();
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  /**
   * Refresca el token de acceso
   */
  private async refreshToken(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// Exportar instancia única del cliente
export const apiClient = new ApiClient(API_BASE_URL);

// Exportar también la URL base para casos especiales
export { API_BASE_URL };
