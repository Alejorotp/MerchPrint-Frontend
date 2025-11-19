"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { authService, eventsService } from "@/lib/api";

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
}

export default function MyOrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setOrdersError(null);
    setIsOrdersLoading(true);
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser?.id) {
        throw new Error("No pudimos identificar al usuario actual.");
      }

      const events = await eventsService.getAllEvents();
      const myEvents = events.filter(
        (event) => event.userId === currentUser.id,
      );

      const requirements = await Promise.all(
        myEvents.map(async (event) => {
          try {
            const data = await eventsService.getRequirementsByEventId(event.id);
            return data[0] ?? null;
          } catch (error) {
            console.error("No se pudieron cargar los requerimientos", {
              eventId: event.id,
              error,
            });
            return null;
          }
        }),
      );

      const now = Date.now();
      const mappedOrders: Order[] = myEvents.map((event, index) => {
        const requirement = requirements[index];
        const specs = requirement?.specs_json as
          | { eventType?: unknown }
          | undefined;
        const eventDate = new Date(event.date);
        const diff = eventDate.getTime() - now;

        let status: OrderStatus = "pending";
        if (diff <= 0) {
          status = "completed";
        } else if (diff <= 1000 * 60 * 60 * 24 * 7) {
          status = "in_progress";
        }

        return {
          id: event.id,
          eventType:
            specs && typeof specs.eventType === "string"
              ? (specs.eventType as string)
              : event.name,
          quantity: requirement?.quantity ?? 0,
          status,
          createdAt: new Date(event.date).toString(),
          estimatedDate: new Date(event.date).toString(),
        };
      });

      setOrders(mappedOrders);
    } catch (error) {
      setOrders([]);
      setOrdersError(
        error instanceof Error
          ? error.message
          : "No pudimos cargar tus pedidos. Intenta nuevamente.",
      );
    } finally {
      setIsOrdersLoading(false);
    }
  }, []);

  // Proteger la ruta y obtener órdenes
  useEffect(() => {
    const verifyAndFetch = async () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (!isLoggedIn) {
        router.push("/login");
        return;
      }
      setIsLoading(false);
      await loadOrders();
    };

    verifyAndFetch();
  }, [router, loadOrders]);

  const statusConfig = {
    all: {
      label: "Ver todo",
      color: "text-gray-700",
      bgColor: "bg-gray-100",
      count: orders.length,
    },
    pending: {
      label: "Pendiente",
      color: "text-yellow-700",
      bgColor: "bg-yellow-100",
      count: orders.filter((o) => o.status === "pending").length,
    },
    in_progress: {
      label: "En progreso",
      color: "text-blue-700",
      bgColor: "bg-blue-100",
      count: orders.filter((o) => o.status === "in_progress").length,
    },
    completed: {
      label: "Completado",
      color: "text-green-700",
      bgColor: "bg-green-100",
      count: orders.filter((o) => o.status === "completed").length,
    },
    cancelled: {
      label: "Cancelado",
      color: "text-red-700",
      bgColor: "bg-red-100",
      count: orders.filter((o) => o.status === "cancelled").length,
    },
  };

  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter((order) => order.status === activeTab);

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
                Gestiona y revisa el estado de tus órdenes
              </p>
            </div>
            <button
              type="button"
              onClick={loadOrders}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:border-blue-500 hover:text-blue-500 transition-all"
            >
              Actualizar lista
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

          {ordersError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {ordersError}
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm p-2 mb-6">
            <div className="flex flex-wrap gap-2">
              {(
                Object.keys(statusConfig) as Array<keyof typeof statusConfig>
              ).map((status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() => setActiveTab(status)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    activeTab === status
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {statusConfig[status].label}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      activeTab === status
                        ? "bg-white/20 text-white"
                        : statusConfig[status].bgColor +
                          " " +
                          statusConfig[status].color
                    }`}
                  >
                    {statusConfig[status].count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-2xl">
              <input
                type="text"
                placeholder="N° de pedido, artículo o tienda"
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-800 placeholder:text-gray-400"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <svg
                  aria-hidden="true"
                  focusable="false"
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {isOrdersLoading ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando pedidos...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No hay pedidos en esta categoría
                </h3>
                <p className="text-gray-600 mb-6">
                  Crea tu primera orden personalizada para tu evento
                </p>
                <Link
                  href="/dashboard"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-full hover:shadow-lg transition-all"
                >
                  Crear nueva orden
                </Link>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              statusConfig[order.status].bgColor
                            } ${statusConfig[order.status].color}`}
                          >
                            {statusConfig[order.status].label}
                          </span>
                          <span className="text-sm text-gray-500">
                            Pedido efectuado el:{" "}
                            {new Date(order.createdAt).toLocaleDateString(
                              "es-ES",
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          N° de pedido:{" "}
                          <button
                            type="button"
                            className="text-blue-500 hover:text-blue-600 font-medium"
                          >
                            {order.id} Copiar
                          </button>
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
                      >
                        Detalles del pedido
                        <svg
                          aria-hidden="true"
                          focusable="false"
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Order Content */}
                    <div className="flex gap-6">
                      {/* Event Icon/Image */}
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-4xl">
                          {order.eventType === "Bodas" && "💍"}
                          {order.eventType === "Conciertos" && "🎵"}
                          {order.eventType === "Conferencias" && "💼"}
                          {order.eventType === "Cumpleaños" && "🎂"}
                        </span>
                      </div>

                      {/* Order Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          Evento: {order.eventType}
                        </h3>
                        <p className="text-gray-600 mb-1">
                          Cantidad: {order.quantity} unidades
                        </p>
                        {order.company && (
                          <p className="text-gray-600 mb-1">
                            <span className="font-medium">Compañía:</span>{" "}
                            {order.company}
                          </p>
                        )}
                        {order.estimatedDate && (
                          <p className="text-green-600 text-sm font-medium">
                            Entrega estimada:{" "}
                            {new Date(order.estimatedDate).toLocaleDateString(
                              "es-ES",
                            )}
                          </p>
                        )}
                      </div>

                      {/* Actions & Price */}
                      <div className="flex flex-col items-end justify-between">
                        {order.price && (
                          <div className="text-right mb-4">
                            <p className="text-sm text-gray-500 mb-1">Total:</p>
                            <p className="text-2xl font-bold text-gray-900">
                              $
                              {order.price.toLocaleString("es-CO", {
                                minimumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                        )}
                        <div className="flex flex-col gap-2 w-48">
                          {order.status === "completed" && (
                            <button
                              type="button"
                              className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                            >
                              Añadir a la cesta
                            </button>
                          )}
                          {order.status === "pending" && (
                            <button
                              type="button"
                              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                            >
                              Ver ofertas
                            </button>
                          )}
                          {order.status === "in_progress" && (
                            <button
                              type="button"
                              className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                            >
                              Seguir pedido
                            </button>
                          )}
                          <button
                            type="button"
                            className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-500 transition-all"
                          >
                            {order.status === "cancelled"
                              ? "Ver detalles"
                              : "Borrar"}
                          </button>
                        </div>
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
