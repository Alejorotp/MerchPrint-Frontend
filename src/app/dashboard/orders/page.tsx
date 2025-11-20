"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { authService, ordersService, eventsService } from "@/lib/api";
import type { OrderDTO, EventDTO, RequirementsDTO } from "@/lib/api";

// Estados de órdenes del backend
type OrderStatus = "pending" | "in_progress" | "completed" | "cancelled";

interface Order {
  id: string;
  eventType: string;
  quantity: number;
  status: OrderStatus;
  createdAt: string;
  company?: string;
  price?: number;
  estimatedDate?: string;
  offer_id?: string;
}

interface ActiveRequest {
  id: string;
  eventName: string;
  location: string;
  date: string;
  description: string;
  quantity: number;
  specs: Record<string, unknown>;
  hasRequirements: boolean;
}

export default function MyOrdersPage() {
  const [activeSection, setActiveSection] = useState<"requests" | "orders">(
    "requests"
  );
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<ActiveRequest[]>([]);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [isRequestsLoading, setIsRequestsLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    setRequestsError(null);
    setIsRequestsLoading(true);
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser?.id) {
        throw new Error("No pudimos identificar al usuario actual.");
      }

      const events = await eventsService.getAllEvents();
      const myEvents = events.filter(
        (event) => event.userId === currentUser.id
      );

      const requestsData = await Promise.all(
        myEvents.map(async (event) => {
          try {
            const requirementsData =
              await eventsService.getRequirementsByEventId(event.id);
            const requirement =
              Array.isArray(requirementsData) && requirementsData.length > 0
                ? requirementsData[0]
                : null;

            return {
              id: event.id,
              eventName: event.name,
              location: event.location,
              date: new Date(event.date).toLocaleDateString("es-ES"),
              description: requirement?.description || "Sin descripción",
              quantity: requirement?.quantity || 0,
              specs: requirement?.specs_json || {},
              hasRequirements: !!requirement,
            };
          } catch (error) {
            // Silenciosamente manejar eventos sin requisitos
            return {
              id: event.id,
              eventName: event.name,
              location: event.location,
              date: new Date(event.date).toLocaleDateString("es-ES"),
              description: "Sin requisitos",
              quantity: 0,
              specs: {},
              hasRequirements: false,
            };
          }
        })
      );

      setRequests(requestsData);
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
      setRequests([]);
      setRequestsError(
        error instanceof Error
          ? error.message
          : "No pudimos cargar tus solicitudes."
      );
    } finally {
      setIsRequestsLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersError(null);
    setIsOrdersLoading(true);
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser?.id) {
        throw new Error("No pudimos identificar al usuario actual.");
      }

      const backendOrders = await ordersService.getOrdersByClientId(
        currentUser.id
      );

      const enrichedOrders = await Promise.all(
        backendOrders.map(async (order) => {
          let status: OrderStatus = "pending";
          if (order.status === "in_progress") status = "in_progress";
          else if (order.status === "completed") status = "completed";
          else if (order.status === "cancelled") status = "cancelled";

          return {
            id: order.id,
            eventType: "Orden #" + order.id.substring(0, 8),
            quantity: 0,
            status,
            createdAt: new Date(order.created_at).toLocaleString("es-ES"),
            offer_id: order.offer_id,
          };
        })
      );

      setOrders(enrichedOrders);
    } catch (error) {
      console.error("Error cargando órdenes:", error);
      setOrders([]);
      setOrdersError(
        error instanceof Error
          ? error.message
          : "No pudimos cargar tus órdenes confirmadas."
      );
    } finally {
      setIsOrdersLoading(false);
    }
  }, []);

  // Proteger la ruta y obtener datos
  useEffect(() => {
    const verifyAndFetch = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }
      setIsLoading(false);
      await Promise.all([loadRequests(), loadOrders()]);
    };

    verifyAndFetch();
  }, [router, loadRequests, loadOrders]);

  const statusConfig = {
    pending: {
      label: "Pendiente",
      color: "text-yellow-700",
      bgColor: "bg-yellow-100",
    },
    in_progress: {
      label: "En progreso",
      color: "text-blue-700",
      bgColor: "bg-blue-100",
    },
    completed: {
      label: "Completado",
      color: "text-green-700",
      bgColor: "bg-green-100",
    },
    cancelled: {
      label: "Cancelado",
      color: "text-red-700",
      bgColor: "bg-red-100",
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Mis pedidos
              </h1>
              <p className="text-gray-600">
                Gestiona tus solicitudes y órdenes confirmadas
              </p>
            </div>
            <button
              type="button"
              onClick={() => Promise.all([loadRequests(), loadOrders()])}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:border-blue-500 hover:text-blue-500 transition-all"
            >
              Actualizar
              <svg
                aria-hidden="true"
                focusable="false"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v6h6M20 20v-6h-6M5 19A9 9 0 0119 5"
                />
              </svg>
            </button>
          </div>

          {/* Section Tabs */}
          <div className="bg-white rounded-2xl shadow-sm p-2 mb-6">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveSection("requests")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all flex-1 ${
                  activeSection === "requests"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                📋 Solicitudes activas
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                    activeSection === "requests"
                      ? "bg-white/20 text-white"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {requests.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSection("orders")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all flex-1 ${
                  activeSection === "orders"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                ✅ Órdenes confirmadas
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                    activeSection === "orders"
                      ? "bg-white/20 text-white"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {orders.length}
                </span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {activeSection === "requests" ? (
              // Solicitudes activas
              isRequestsLoading ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando solicitudes...</p>
                </div>
              ) : requestsError ? (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {requestsError}
                </div>
              ) : requests.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No tienes solicitudes activas
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Crea un evento y agrega requisitos para comenzar
                  </p>
                  <Link
                    href="/dashboard/orders/new"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-full hover:shadow-lg transition-all"
                  >
                    Crear nueva solicitud
                  </Link>
                </div>
              ) : (
                requests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-6"
                  >
                    <div className="flex gap-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl">📋</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {request.eventName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              📍 {request.location} · 📅 {request.date}
                            </p>
                          </div>
                          {!request.hasRequirements && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                              Sin requisitos
                            </span>
                          )}
                        </div>
                        {request.hasRequirements && (
                          <div className="mb-4">
                            <p className="text-gray-700 mb-1">
                              <span className="font-semibold">
                                Descripción:
                              </span>{" "}
                              {request.description}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-semibold">Cantidad:</span>{" "}
                              {request.quantity} unidades
                            </p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          {request.hasRequirements ? (
                            <>
                              <button
                                type="button"
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                              >
                                Ver ofertas
                              </button>
                              <Link
                                href={`/dashboard/orders/requirements?eventId=${request.id}`}
                                className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-500 transition-all"
                              >
                                Agregar más
                              </Link>
                            </>
                          ) : (
                            <Link
                              href={`/dashboard/orders/requirements?eventId=${request.id}`}
                              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                            >
                              Agregar requisitos
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : // Órdenes confirmadas
            isOrdersLoading ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando órdenes...</p>
              </div>
            ) : ordersError ? (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {ordersError}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No tienes órdenes confirmadas
                </h3>
                <p className="text-gray-600 mb-6">
                  Las órdenes aparecerán aquí cuando aceptes una oferta
                </p>
                <button
                  type="button"
                  onClick={() => setActiveSection("requests")}
                  className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-full hover:shadow-lg transition-all"
                >
                  Ver solicitudes activas
                </button>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-6"
                >
                  <div className="flex gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">✅</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {order.eventType}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Creada el {order.createdAt}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            statusConfig[order.status].bgColor
                          } ${statusConfig[order.status].color}`}
                        >
                          {statusConfig[order.status].label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        ID: <span className="font-mono">{order.id}</span>
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                        >
                          Ver detalles
                        </button>
                        {order.status === "in_progress" && (
                          <button
                            type="button"
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                          >
                            Seguir pedido
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
