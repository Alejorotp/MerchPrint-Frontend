/**
 * API Library - Punto de entrada principal
 * Exporta todos los servicios y tipos necesarios para consumir la API
 */

// Cliente API
export { API_BASE_URL, apiClient } from "./client";

// Servicios
export { authService } from "./services/auth.service";
export { companiesService } from "./services/companies.service";
export { eventsService } from "./services/events.service";
export { ordersService } from "./services/orders.service";

// Tipos
export type {
  AcceptOfferDTO,
  ApiError,
  AuctionDTO,
  AuthResponse,
  CompanyDTO,
  CreateAuctionDTO,
  CreateCompanyDTO,
  CreateEventDTO,
  CreateOfferDTO,
  CreateOrderDTO,
  CreateProductDTO,
  CreateRequirementsDTO,
  CreateRoleDTO,
  CreateUserDTO,
  EventDTO,
  LoginDTO,
  OfferDTO,
  OrderDTO,
  PaginatedResponse,
  ProductDTO,
  RequirementsDTO,
  RoleDTO,
  UserDTO,
} from "./types";
