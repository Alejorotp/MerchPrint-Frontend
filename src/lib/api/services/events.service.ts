/**
 * Servicio de Eventos, Subastas y Requisitos
 * Maneja la gestión de eventos y sus componentes relacionados
 */

import { apiClient } from "../client";
import type {
  CreateEventDTO,
  EventDTO,
  CreateAuctionDTO,
  AuctionDTO,
  CreateRequirementsDTO,
  RequirementsDTO,
} from "../types";

export const eventsService = {
  // ============================================
  // Eventos
  // ============================================

  /**
   * Crear un nuevo evento
   */
  async createEvent(data: CreateEventDTO): Promise<EventDTO> {
    return apiClient.post<EventDTO>("/events", data);
  },

  /**
   * Obtener todos los eventos
   */
  async getAllEvents(): Promise<EventDTO[]> {
    return apiClient.get<EventDTO[]>("/events");
  },

  /**
   * Obtener evento por ID
   */
  async getEventById(id: string): Promise<EventDTO> {
    return apiClient.get<EventDTO>(`/events/${id}`);
  },

  /**
   * Actualizar evento
   */
  async updateEvent(
    id: string,
    data: Partial<CreateEventDTO>
  ): Promise<EventDTO> {
    return apiClient.put<EventDTO>(`/events/update/${id}`, data);
  },

  /**
   * Eliminar evento
   */
  async deleteEvent(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/events/delete/${id}`);
  },

  // ============================================
  // Subastas
  // ============================================

  /**
   * Crear una subasta para un evento
   */
  async createAuction(data: CreateAuctionDTO): Promise<AuctionDTO> {
    return apiClient.post<AuctionDTO>("/auctions", data);
  },

  /**
   * Obtener subasta por ID
   */
  async getAuctionById(id: string): Promise<AuctionDTO> {
    return apiClient.get<AuctionDTO>(`/auctions/${id}`);
  },

  /**
   * Cancelar una subasta
   */
  async cancelAuction(eventId: string): Promise<AuctionDTO> {
    return apiClient.post<AuctionDTO>(`/auctions/cancel/${eventId}`, {});
  },

  /**
   * Finalizar una subasta
   */
  async endAuction(eventId: string): Promise<AuctionDTO> {
    return apiClient.post<AuctionDTO>(`/auctions/end/${eventId}`, {});
  },

  // ============================================
  // Requisitos
  // ============================================

  /**
   * Crear requisitos para un evento
   */
  async createRequirements(
    eventId: string,
    data: Omit<CreateRequirementsDTO, "eventId">
  ): Promise<RequirementsDTO> {
    return apiClient.post<RequirementsDTO>("/requirements", {
      ...data,
      eventId,
    });
  },

  /**
   * Obtener requisitos de un evento
   */
  async getRequirementsByEventId(eventId: string): Promise<RequirementsDTO[]> {
    return apiClient.get<RequirementsDTO[]>(`/requirements/event/${eventId}`);
  },

  /**
   * Actualizar requisitos
   */
  async updateRequirements(
    id: string,
    data: Partial<CreateRequirementsDTO>
  ): Promise<RequirementsDTO> {
    return apiClient.put<RequirementsDTO>(`/requirements/update/${id}`, data);
  },

  /**
   * Eliminar requisitos
   */
  async deleteRequirements(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/requirements/delete/${id}`);
  },
};
