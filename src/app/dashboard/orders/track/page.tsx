"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { ordersService, eventsService, offersService, companiesService } from "@/lib/api";
import type { OrderDTO, EventDTO, OfferDTO, CompanyDTO } from "@/lib/api";

type OrderStatus = "pending" | "in_progress" | "completed" | "cancelled";

interface OrderDetails {
  order: OrderDTO;
  event: EventDTO | null;
  offer: OfferDTO | null;
  company: CompanyDTO | null;
}

const statusConfig = {
  pending: {
    label: "Pendiente",
    description: "Tu orden está siendo procesada",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: "⏳",
  },
  in_progress: {
    label: "En progreso",
    description: "La empresa está trabajando en tu pedido",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: "🔨",
  },
  completed: {
    label: "Completado",
    description: "Tu pedido está listo",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: "✅",
  },
  cancelled: {
    label: "Cancelado",
    description: "Esta orden fue cancelada",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: "❌",
  },
};

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

import { Suspense } from "react";

function TrackOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    if (!orderId) {
      setError("No se especificó una orden.");
      setIsLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);

        // Obtener la orden
        const order = await ordersService.getOrderById(orderId);

        // Obtener la oferta asociada
        let offer: OfferDTO | null = null;
        let event: EventDTO | null = null;
        let company: CompanyDTO | null = null;

        try {
          offer = await ordersService.getOfferById(order.offer_id);

          // Obtener la empresa desde la oferta
          if (offer?.company_id) {
            try {
              company = await companiesService.getCompanyById(offer.company_id);
            } catch (err) {
              console.error("Error obteniendo empresa:", err);
            }
          }

          // Obtener el evento a través de la subasta
          if (offer?.auction_id) {
            const auction = await eventsService.getAuctionById(
              offer.auction_id
            );
            if (auction?.event_id) {
              event = await eventsService.getEventById(auction.event_id);
            }
          }
        } catch (err) {
          console.error("Error obteniendo detalles adicionales:", err);
        }

        setOrderDetails({ order, event, offer, company });
      } catch (err) {
        console.error("Error cargando orden:", err);
        setError("No pudimos cargar los detalles de la orden.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();

    const handleAuthChange = () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.replace("/login");
      }
    };

    window.addEventListener("loginStatusChanged", handleAuthChange);

    return () => {
      window.removeEventListener("loginStatusChanged", handleAuthChange);
    };
  }, [orderId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
              {error || "No se pudo cargar la orden."}
            </div>
            <div className="mt-6">
              <Link
                href="/dashboard/orders"
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                ← Volver a mis pedidos
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { order, event, offer, company } = orderDetails;
  const status = order.status as OrderStatus;
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard/orders"
              className="text-blue-500 hover:text-blue-600 font-medium mb-4 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Volver a mis pedidos
            </Link>

            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Seguimiento de pedido
            </h1>
            <p className="text-gray-600">
              ID: <span className="font-mono">{order.id}</span>
            </p>
          </div>

          {/* Estado actual */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
            <div className="flex items-center gap-6 mb-6">
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl ${config.bgColor}`}
              >
                {config.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {config.label}
                </h2>
                <p className="text-gray-600">{config.description}</p>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-bold ${config.bgColor} ${config.color}`}
              >
                {config.label}
              </span>
            </div>

            {/* Timeline de progreso */}
            <div className="mt-8">
              <div className="flex justify-between items-center relative">
                {/* Línea de progreso */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
                  <div
                    className={`h-full ${status === "completed"
                        ? "bg-green-500 w-full"
                        : status === "in_progress"
                          ? "bg-blue-500 w-1/2"
                          : status === "cancelled"
                            ? "bg-red-500 w-0"
                            : "bg-yellow-500 w-1/4"
                      } transition-all duration-500`}
                  />
                </div>

                {/* Paso 1: Pendiente */}
                <div className="relative flex flex-col items-center z-10">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${status !== "cancelled"
                        ? "bg-yellow-500 border-yellow-200"
                        : "bg-gray-300 border-gray-200"
                      }`}
                  >
                    <span className="text-white text-lg">⏳</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-gray-600">
                    Recibida
                  </p>
                </div>

                {/* Paso 2: En progreso */}
                <div className="relative flex flex-col items-center z-10">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${status === "in_progress" || status === "completed"
                        ? "bg-blue-500 border-blue-200"
                        : "bg-gray-300 border-gray-200"
                      }`}
                  >
                    <span className="text-white text-lg">🔨</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-gray-600">
                    En producción
                  </p>
                </div>

                {/* Paso 3: Completado */}
                <div className="relative flex flex-col items-center z-10">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${status === "completed"
                        ? "bg-green-500 border-green-200"
                        : "bg-gray-300 border-gray-200"
                      }`}
                  >
                    <span className="text-white text-lg">✅</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-gray-600">
                    Completado
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles de la orden */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Detalles de la orden
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Fecha de creación</p>
                <p className="text-base font-semibold text-gray-900">
                  {new Date(order.created_at).toLocaleString("es-ES")}
                </p>
              </div>

              {offer && (
                <>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Precio</p>
                    <p className="text-base font-semibold text-gray-900">
                      {currencyFormatter.format(offer.price)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Tiempo de entrega
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {offer.lead_time_days} días
                    </p>
                  </div>
                </>
              )}

              {event && (
                <>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Evento</p>
                    <p className="text-base font-semibold text-gray-900">
                      {event.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ubicación</p>
                    <p className="text-base font-semibold text-gray-900">
                      {event.location}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Fecha del evento
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {new Date(event.date).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                </>
              )}

              {company && (
                <>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Empresa</p>
                    <p className="text-base font-semibold text-gray-900">
                      {company.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Contacto</p>
                    <p className="text-base font-semibold text-gray-900">
                      {company.contactEmail}
                    </p>
                  </div>
                </>
              )}
            </div>

            {event && (
              <div className="mt-6">
                <Link
                  href={`/dashboard/orders/info?eventId=${event.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 border-2 border-blue-200 text-blue-600 font-semibold rounded-xl hover:border-blue-400 hover:text-blue-700 transition-all"
                >
                  Ver detalles completos del evento
                </Link>
              </div>
            )}
          </div>

          {/* Ayuda y soporte */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  ¿Necesitas ayuda?
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  Si tienes alguna pregunta sobre tu pedido o necesitas
                  asistencia, estamos aquí para ayudarte.
                </p>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
                >
                  Contactar soporte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
