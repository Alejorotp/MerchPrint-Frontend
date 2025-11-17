/**
 * Servicio de Órdenes y Ofertas
 * Maneja la gestión de órdenes y ofertas en subastas
 */

import { apiClient } from "../client";
import type {
  CreateOrderDTO,
  OrderDTO,
  CreateOfferDTO,
  OfferDTO,
  AcceptOfferDTO,
} from "../types";

export const ordersService = {
  // ============================================
  // Órdenes
  // ============================================

  /**
   * Crear una nueva orden
   */
  async createOrder(data: CreateOrderDTO): Promise<OrderDTO> {
    return apiClient.post<OrderDTO>("/orders", data);
  },

  /**
   * Obtener orden por ID
   */
  async getOrderById(id: string): Promise<OrderDTO> {
    return apiClient.get<OrderDTO>(`/orders/${id}`);
  },

  /**
   * Obtener todas las órdenes de un cliente
   */
  async getOrdersByClientId(clientId: string): Promise<OrderDTO[]> {
    return apiClient.get<OrderDTO[]>(`/clients/${clientId}/orders`);
  },

  /**
   * Actualizar estado de una orden
   */
  async updateOrderStatus(id: string, status: string): Promise<OrderDTO> {
    return apiClient.put<OrderDTO>(`/orders/${id}/status`, { status });
  },

  /**
   * Cancelar una orden
   */
  async cancelOrder(id: string): Promise<OrderDTO> {
    return apiClient.put<OrderDTO>(`/orders/${id}/cancel`, {});
  },

  /**
   * Eliminar una orden
   */
  async deleteOrder(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/orders/${id}`);
  },

  // ============================================
  // Ofertas
  // ============================================

  /**
   * Crear una nueva oferta
   */
  async createOffer(data: CreateOfferDTO): Promise<OfferDTO> {
    return apiClient.post<OfferDTO>("/offers", data);
  },

  /**
   * Obtener oferta por ID
   */
  async getOfferById(id: string): Promise<OfferDTO> {
    return apiClient.get<OfferDTO>(`/offers/${id}`);
  },

  /**
   * Obtener todas las ofertas de una subasta
   */
  async getOffersByAuctionId(auctionId: string): Promise<OfferDTO[]> {
    return apiClient.get<OfferDTO[]>(`/auctions/${auctionId}/offers`);
  },

  /**
   * Obtener todas las ofertas de una empresa
   */
  async getOffersByCompanyId(companyId: string): Promise<OfferDTO[]> {
    return apiClient.get<OfferDTO[]>(`/companies/${companyId}/offers`);
  },

  /**
   * Actualizar una oferta
   */
  async updateOffer(
    id: string,
    data: Partial<CreateOfferDTO>
  ): Promise<OfferDTO> {
    return apiClient.put<OfferDTO>(`/offers/${id}`, data);
  },

  /**
   * Eliminar una oferta
   */
  async deleteOffer(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/offers/${id}`);
  },

  /**
   * Aceptar una oferta (crea una orden automáticamente)
   */
  async acceptOffer(data: AcceptOfferDTO): Promise<OrderDTO> {
    return apiClient.post<OrderDTO>("/offers/accept", data);
  },

  /**
   * Rechazar una oferta
   */
  async rejectOffer(id: string, reason?: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/offers/${id}/reject`, {
      reason,
    });
  },
};
