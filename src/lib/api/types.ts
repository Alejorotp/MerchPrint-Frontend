/**
 * Tipos de datos para la API
 * Basados en los DTOs del backend
 */

// ============================================
// AUTH - Autenticación y Usuarios
// ============================================

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  name: string;
  roleId: string;
}

export interface CreateUserDTO {
  email: string;
  name: string;
  password: string;
  roleId: string;
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  roleId: string;
}

export interface CreateRoleDTO {
  name: string;
  permissions: string[];
}

export interface RoleDTO {
  id: string;
  name: string;
  permissions: string[];
}

// ============================================
// COMPANIES - Empresas y Productos
// ============================================

export interface CreateCompanyDTO {
  userId: string;
  name: string;
  contactEmail: string;
}

export interface CompanyDTO {
  id: string;
  userId: string;
  name: string;
  contactEmail: string;
}

export interface CreateProductDTO {
  companyId: string;
  name: string;
  basePrice: number;
  optionsJson?: {
    colors?: string[];
    sizes?: string[];
    materials?: string[];
    [key: string]: unknown;
  };
}

export interface ProductDTO {
  id: string;
  companyId: string;
  name: string;
  basePrice: number;
  optionsJson?: {
    colors?: string[];
    sizes?: string[];
    materials?: string[];
    [key: string]: unknown;
  };
}

// ============================================
// EVENTS - Eventos, Subastas y Requisitos
// ============================================

export interface CreateEventDTO {
  userId: string;
  name: string;
  date: Date | string;
  location: string;
}

export interface EventDTO {
  id: string;
  userId: string;
  name: string;
  date: Date | string;
  location: string;
}

export interface CreateAuctionDTO {
  event_id: string;
  start_at: Date | string;
  end_at: Date | string;
  suggested_price: number;
  company_id?: string;
}

export interface AuctionDTO {
  id: string;
  event_id: string;
  start_at: Date | string;
  end_at: Date | string;
  suggested_price: number;
  status: "active" | "cancelled" | "ended";
  company_id?: string;
}

export interface CreateRequirementsDTO {
  eventId: string;
  description: string;
  quantity: number;
  specs_json: Record<string, unknown>;
}

export interface RequirementsDTO {
  id: string;
  eventId: string;
  description: string;
  quantity: number;
  specs_json: Record<string, unknown>;
}

// ============================================
// ORDERS - Órdenes y Ofertas
// ============================================

export interface CreateOrderDTO {
  client_id: string;
  offer_id: string;
}

export interface OrderDTO {
  id: string;
  client_id: string;
  offer_id: string;
  status: string;
  created_at: Date | string;
}

export interface CreateOfferDTO {
  auction_id: string;
  company_id: string;
  price: number;
  lead_time_days: number;
  specs_json?: Record<string, unknown>;
}

export interface OfferDTO {
  id: string;
  auction_id: string;
  company_id: string;
  price: number;
  lead_time_days: number;
  status: "pending" | "accepted" | "rejected";
  created_at: Date | string;
  specs_json?: Record<string, unknown>;
}

export interface AcceptOfferDTO {
  offerId: string;
  clientId: string;
}

// ============================================
// Tipos de utilidad
// ============================================

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
