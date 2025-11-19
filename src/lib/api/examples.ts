/**
 * EJEMPLO DE USO DE LA API
 *
 * Este archivo muestra cómo usar los servicios del API en tus componentes
 */

import {
  authService,
  type CreateEventDTO,
  type CreateOfferDTO,
  companiesService,
  eventsService,
  type LoginDTO,
  ordersService,
} from "@/lib/api";

// ============================================
// 1. AUTENTICACIÓN
// ============================================

/**
 * Ejemplo: Login
 */
async function ejemploLogin() {
  try {
    const credentials: LoginDTO = {
      email: "user@example.com",
      password: "password123",
    };

    const response = await authService.login(credentials);
    console.log("Usuario autenticado:", response);
    // Los tokens se guardan automáticamente en localStorage

    // Obtener usuario actual
    const currentUser = authService.getCurrentUser();
    console.log("Usuario actual:", currentUser);
  } catch (error) {
    console.error("Error en login:", error);
  }
}

/**
 * Ejemplo: Crear usuario
 */
async function ejemploCrearUsuario() {
  try {
    const newUser = await authService.createUser({
      email: "nuevo@example.com",
      name: "Juan Pérez",
      password: "password123",
      roleId: "role-id-123",
    });
    console.log("Usuario creado:", newUser);
  } catch (error) {
    console.error("Error al crear usuario:", error);
  }
}

/**
 * Ejemplo: Logout
 */
function ejemploLogout() {
  authService.logout();
  // Limpia localStorage y redirige al login
}

// ============================================
// 2. EMPRESAS Y PRODUCTOS
// ============================================

/**
 * Ejemplo: Crear empresa
 */
async function ejemploCrearEmpresa() {
  try {
    const newCompany = await companiesService.createCompany({
      userId: "user-123",
      name: "Mi Empresa",
      contactEmail: "contacto@miempresa.com",
    });
    console.log("Empresa creada:", newCompany);
  } catch (error) {
    console.error("Error al crear empresa:", error);
  }
}

/**
 * Ejemplo: Obtener empresas
 */
async function ejemploObtenerEmpresas() {
  try {
    const companies = await companiesService.getAllCompanies();
    console.log("Empresas:", companies);
  } catch (error) {
    console.error("Error al obtener empresas:", error);
  }
}

/**
 * Ejemplo: Crear producto
 */
async function ejemploCrearProducto() {
  try {
    const newProduct = await companiesService.createProduct("company-id-123", {
      name: "Camiseta Personalizada",
      basePrice: 29.99,
      optionsJson: {
        colors: ["rojo", "azul", "verde"],
        sizes: ["S", "M", "L", "XL"],
        materials: ["algodón", "poliéster"],
      },
    });
    console.log("Producto creado:", newProduct);
  } catch (error) {
    console.error("Error al crear producto:", error);
  }
}

// ============================================
// 3. EVENTOS Y SUBASTAS
// ============================================

/**
 * Ejemplo: Crear evento
 */
async function ejemploCrearEvento() {
  try {
    const eventData: CreateEventDTO = {
      userId: "user-123",
      name: "Conferencia Tech 2025",
      date: new Date("2025-12-15"),
      location: "Centro de Convenciones",
    };

    const newEvent = await eventsService.createEvent(eventData);
    console.log("Evento creado:", newEvent);
  } catch (error) {
    console.error("Error al crear evento:", error);
  }
}

/**
 * Ejemplo: Crear subasta
 */
async function ejemploCrearSubasta() {
  try {
    const auction = await eventsService.createAuction({
      event_id: "event-id-123",
      start_at: new Date("2025-11-20T10:00:00"),
      end_at: new Date("2025-11-27T18:00:00"),
      suggested_price: 5000,
    });
    console.log("Subasta creada:", auction);
  } catch (error) {
    console.error("Error al crear subasta:", error);
  }
}

/**
 * Ejemplo: Crear requisitos para evento
 */
async function ejemploCrearRequisitos() {
  try {
    const requirements = await eventsService.createRequirements(
      "event-id-123",
      {
        description: "500 camisetas personalizadas",
        quantity: 500,
        specs_json: {
          material: "algodón 100%",
          colores: ["azul", "blanco"],
          logo: "logo-empresa.png",
          impresion: "serigrafía",
        },
      },
    );
    console.log("Requisitos creados:", requirements);
  } catch (error) {
    console.error("Error al crear requisitos:", error);
  }
}

// ============================================
// 4. OFERTAS Y ÓRDENES
// ============================================

/**
 * Ejemplo: Crear oferta en subasta
 */
async function ejemploCrearOferta() {
  try {
    const offerData: CreateOfferDTO = {
      auction_id: "auction-id-123",
      company_id: "company-id-123",
      price: 4500,
      lead_time_days: 14,
      specs_json: {
        material: "algodón orgánico",
        colores_disponibles: ["azul", "blanco", "gris"],
        garantia: "6 meses",
      },
    };

    const newOffer = await ordersService.createOffer(offerData);
    console.log("Oferta creada:", newOffer);
  } catch (error) {
    console.error("Error al crear oferta:", error);
  }
}

/**
 * Ejemplo: Obtener ofertas de una subasta
 */
async function ejemploObtenerOfertas() {
  try {
    const offers = await ordersService.getOffersByAuctionId("auction-id-123");
    console.log("Ofertas de la subasta:", offers);

    // Ordenar por precio
    const sortedByPrice = [...offers].sort((a, b) => a.price - b.price);
    console.log("Mejor precio:", sortedByPrice[0]);
  } catch (error) {
    console.error("Error al obtener ofertas:", error);
  }
}

/**
 * Ejemplo: Aceptar oferta (crea orden automáticamente)
 */
async function ejemploAceptarOferta() {
  try {
    const order = await ordersService.acceptOffer({
      offerId: "offer-id-123",
      clientId: "client-id-123",
    });
    console.log("Oferta aceptada, orden creada:", order);
  } catch (error) {
    console.error("Error al aceptar oferta:", error);
  }
}

/**
 * Ejemplo: Obtener órdenes de un cliente
 */
async function ejemploObtenerOrdenes() {
  try {
    const orders = await ordersService.getOrdersByClientId("client-id-123");
    console.log("Órdenes del cliente:", orders);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
  }
}

/**
 * Ejemplo: Actualizar estado de orden
 */
async function ejemploActualizarEstadoOrden() {
  try {
    const updatedOrder = await ordersService.updateOrderStatus(
      "order-id-123",
      "en_produccion",
    );
    console.log("Orden actualizada:", updatedOrder);
  } catch (error) {
    console.error("Error al actualizar orden:", error);
  }
}

// ============================================
// 5. EJEMPLO EN UN COMPONENTE DE REACT
// ============================================

/**
 * Ejemplo de uso en un componente React con hooks
 */
/*
'use client';

import { useState, useEffect } from 'react';
import { eventsService, type EventDTO } from '@/lib/api';

export default function EventsPage() {
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      const data = await eventsService.getAllEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Cargando eventos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Eventos</h1>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            {event.name} - {event.location}
          </li>
        ))}
      </ul>
    </div>
  );
}
*/

// ============================================
// 6. MANEJO DE ERRORES
// ============================================

/**
 * Ejemplo: Manejo de errores con try-catch
 */
async function ejemploManejoErrores() {
  try {
    const user = await authService.getUserById("invalid-id");
    console.log(user);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);

      // Puedes verificar el tipo de error
      if (error.message.includes("404")) {
        console.log("Usuario no encontrado");
      } else if (error.message.includes("401")) {
        console.log("No autorizado, redirigiendo al login...");
        authService.logout();
      }
    }
  }
}

// ============================================
// EXPORTAR EJEMPLOS (opcional)
// ============================================

export {
  ejemploLogin,
  ejemploCrearUsuario,
  ejemploLogout,
  ejemploCrearEmpresa,
  ejemploObtenerEmpresas,
  ejemploCrearProducto,
  ejemploCrearEvento,
  ejemploCrearSubasta,
  ejemploCrearRequisitos,
  ejemploCrearOferta,
  ejemploObtenerOfertas,
  ejemploAceptarOferta,
  ejemploObtenerOrdenes,
  ejemploActualizarEstadoOrden,
  ejemploManejoErrores,
};
