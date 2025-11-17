/**
 * API Library - Punto de entrada principal
 * Exporta todos los servicios y tipos necesarios para consumir la API
 */

// Cliente API
export { apiClient, API_BASE_URL } from "./client";

// Servicios
export { authService } from "./services/auth.service";
export { companiesService } from "./services/companies.service";
export { eventsService } from "./services/events.service";
export { ordersService } from "./services/orders.service";

// Tipos
export type {
  // Auth
  LoginDTO,
  AuthResponse,
  CreateUserDTO,
  UserDTO,
  CreateRoleDTO,
  RoleDTO,
  // Companies
  CreateCompanyDTO,
  CompanyDTO,
  CreateProductDTO,
  ProductDTO,
  // Events
  CreateEventDTO,
  EventDTO,
  CreateAuctionDTO,
  AuctionDTO,
  CreateRequirementsDTO,
  RequirementsDTO,
  // Orders
  CreateOrderDTO,
  OrderDTO,
  CreateOfferDTO,
  OfferDTO,
  AcceptOfferDTO,
  // Utils
  ApiError,
  PaginatedResponse,
} from "./types";
