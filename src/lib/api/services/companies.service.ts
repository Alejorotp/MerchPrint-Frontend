/**
 * Servicio de Empresas y Productos
 * Maneja operaciones CRUD para empresas y sus productos
 */

import { apiClient } from "../client";
import type {
  CompanyDTO,
  CreateCompanyDTO,
  CreateProductDTO,
  ProductDTO,
} from "../types";

export const companiesService = {
  // ============================================
  // Empresas
  // ============================================

  /**
   * Crear una nueva empresa
   */
  async createCompany(data: CreateCompanyDTO): Promise<CompanyDTO> {
    return apiClient.post<CompanyDTO>("/companies", data);
  },

  /**
   * Obtener todas las empresas
   */
  async getAllCompanies(): Promise<CompanyDTO[]> {
    return apiClient.get<CompanyDTO[]>("/companies");
  },

  /**
   * Obtener empresa por ID
   */
  async getCompanyById(id: string): Promise<CompanyDTO> {
    return apiClient.get<CompanyDTO>(`/companies/${id}`);
  },

  /**
   * Actualizar empresa
   */
  async updateCompany(
    id: string,
    data: Partial<CreateCompanyDTO>,
  ): Promise<CompanyDTO> {
    return apiClient.put<CompanyDTO>(`/companies/${id}`, data);
  },

  /**
   * Eliminar empresa
   */
  async deleteCompany(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/companies/${id}`);
  },

  // ============================================
  // Productos
  // ============================================

  /**
   * Crear un nuevo producto para una empresa
   */
  async createProduct(
    companyId: string,
    data: Omit<CreateProductDTO, "companyId">,
  ): Promise<ProductDTO> {
    return apiClient.post<ProductDTO>(`/companies/${companyId}/products`, {
      ...data,
      companyId,
    });
  },

  /**
   * Obtener todos los productos de una empresa
   */
  async getProductsByCompany(companyId: string): Promise<ProductDTO[]> {
    return apiClient.get<ProductDTO[]>(`/companies/${companyId}/products`);
  },

  /**
   * Obtener producto por ID
   */
  async getProductById(id: string): Promise<ProductDTO> {
    return apiClient.get<ProductDTO>(`/companies/products/${id}`);
  },

  /**
   * Actualizar producto
   */
  async updateProduct(
    id: string,
    data: Partial<CreateProductDTO>,
  ): Promise<ProductDTO> {
    return apiClient.put<ProductDTO>(`/companies/products/${id}`, data);
  },

  /**
   * Eliminar producto
   */
  async deleteProduct(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/companies/products/${id}`);
  },
};
