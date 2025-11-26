/**
 * Servicio de Ofertas
 * Maneja las ofertas de las compañías a las subastas
 */

import { apiClient } from "../client";
import type { CreateOfferDTO, OfferDTO } from "../types";

export const offersService = {
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
   * Obtener ofertas de una subasta
   */
  async getOffersByAuctionId(auctionId: string): Promise<OfferDTO[]> {
    return apiClient.get<OfferDTO[]>(`/auctions/${auctionId}/offers`);
  },

  /**
   * Obtener ofertas de una compañía
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
   * Rechazar una oferta
   */
  async rejectOffer(id: string): Promise<OfferDTO> {
    return apiClient.put<OfferDTO>(`/offers/${id}/reject`, {});
  },

  /**
   * Aceptar una oferta
   */
  async acceptOffer(id: string): Promise<OfferDTO> {
    return apiClient.put<OfferDTO>(`/offers/${id}/accept`, {});
  },
};
