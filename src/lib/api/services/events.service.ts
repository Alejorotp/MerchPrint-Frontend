/**
 * Servicio de Eventos, Subastas y Requisitos
 * Maneja la gestión de eventos y sus componentes relacionados
 */

import { apiClient } from "../client";
import type {
  AuctionDTO,
  CreateAuctionDTO,
  CreateEventDTO,
  CreateRequirementsDTO,
  EventDTO,
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
   * Obtener eventos por ID de usuario
   */
  async getEventsByUserId(userId: string): Promise<EventDTO[]> {
    return apiClient.get<EventDTO[]>(`/events/user/${userId}`);
  },

  /**
   * Obtener subasta por ID de evento
   */
  async getAuctionByEventId(eventId: string): Promise<AuctionDTO | null> {
    try {
      return await apiClient.get<AuctionDTO>(
        `/events/auctions/event/${eventId}`
      );
    } catch (error) {
      console.error(`No se encontró subasta para el evento ${eventId}`);
      return null;
    }
  },

  /**
   * Obtener subasta por ID
   */
  async getAuctionById(auctionId: string): Promise<AuctionDTO | null> {
    try {
      return await apiClient.get<AuctionDTO>(
        `/events/auctions/${auctionId}`
      );
    } catch (error) {
      console.error(`No se encontró subasta con ID ${auctionId}`);
      return null;
    }
  },

  /**
   * Crear subasta para un evento
   */
  async createAuction(data: CreateAuctionDTO): Promise<AuctionDTO> {
    return apiClient.post<AuctionDTO>("/events/auctions", data);
  },

  /**
   * Crear requisitos para un evento
   */
  async createRequirements(
    eventId: string,
    data: Omit<CreateRequirementsDTO, "eventId">
  ): Promise<RequirementsDTO> {
    return apiClient.post<RequirementsDTO>(
      `/events/${eventId}/requirements`,
      data
    );
  },

  /**
   * Obtener todos los requisitos de un evento
   */
  async getRequirementsByEventId(eventId: string): Promise<RequirementsDTO[]> {
    return apiClient.get<RequirementsDTO[]>(`/events/${eventId}/requirements`);
  },

  /**
   * Actualizar requisitos
   */
  async updateRequirements(
    id: string,
    data: Partial<CreateRequirementsDTO>
  ): Promise<RequirementsDTO> {
    return apiClient.put<RequirementsDTO>(`/events/requirements/${id}`, data);
  },

  /**
   * Eliminar requisitos
   */
  async deleteRequirements(id: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/events/requirements/${id}`);
  },
};
