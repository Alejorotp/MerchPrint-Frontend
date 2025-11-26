"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { authService, eventsService, offersService } from "@/lib/api";
import type { EventDTO, OfferDTO, RequirementsDTO } from "@/lib/api";

interface OrderDetails {
  event: EventDTO | null;
  offer: OfferDTO | null;
  requirements: RequirementsDTO[];
}

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

import { Suspense } from "react";

function TrackOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const offerId = searchParams.get("offerId");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.replace("/login");
        return;
      }

      const currentUser = authService.getCurrentUser();
      if (
        !currentUser?.roleId ||
        currentUser.roleId !== "692641d17ad15076fef187d1"
      ) {
        router.replace("/dashboard");
        return;
      }

      if (!offerId) {
        setError("No se especificó una oferta.");
        setIsLoading(false);
        return;
      }

      await fetchOrderDetails();
    };

    verify();

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
  }, [offerId, router]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);

      // Obtener la oferta
      const offer = await offersService.getOfferById(offerId!);

      let event: EventDTO | null = null;
      let requirements: RequirementsDTO[] = [];

      try {
        // Obtener el evento a través de la subasta
        if (offer?.auction_id) {
          const auction = await eventsService.getAuctionById(offer.auction_id);
          if (auction?.event_id) {
            event = await eventsService.getEventById(auction.event_id);
            // Obtener los requerimientos del evento
            requirements = await eventsService.getRequirementsByEventId(auction.event_id);
          }
        }
      } catch (err) {
        console.error("Error obteniendo detalles adicionales:", err);
      }

      setOrderDetails({ event, offer, requirements });
    } catch (err) {
      console.error("Error cargando oferta:", err);
      setError("No pudimos cargar los detalles de la oferta.");
    } finally {
      setIsLoading(false);
    }
  };

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
                href="/company/orders"
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                ← Volver a mis órdenes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { event, offer, requirements } = orderDetails;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/company/orders"
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
              Volver a mis órdenes
            </Link>

            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Detalles de la oferta
            </h1>
            <p className="text-gray-600">
              ID: <span className="font-mono">{offer?.id}</span>
            </p>
          </div>

          {/* Información del evento */}
          {event && (
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Información del evento
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nombre</p>
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
                  <p className="text-sm text-gray-500 mb-1">Fecha del evento</p>
                  <p className="text-base font-semibold text-gray-900">
                    {new Date(event.date).toLocaleString("es-ES", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">ID de Usuario</p>
                  <p className="text-base font-semibold text-gray-900 font-mono">
                    {event.userId}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Detalles de la oferta */}
          {offer && (
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Tu oferta
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
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

                <div>
                  <p className="text-sm text-gray-500 mb-1">Fecha de oferta</p>
                  <p className="text-base font-semibold text-gray-900">
                    {new Date(offer.created_at).toLocaleString("es-ES")}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Estado</p>
                  <p className="text-base font-semibold text-green-700">
                    {offer.status === "accepted" ? "Aceptada" : offer.status}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Requerimientos del cliente */}
          {requirements.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Requerimientos del cliente
              </h3>

              <div className="space-y-6">
                {requirements.map((req) => {
                  // Extract images from specs_json
                  const specs = req.specs_json ?? {};
                  const { images, ...restSpecs } = specs as {
                    images?: unknown;
                    [key: string]: unknown;
                  };
                  const normalizedImages = Array.isArray(images)
                    ? images.filter((img): img is string => typeof img === "string")
                    : [];

                  return (
                    <div
                      key={req.id}
                      className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-4"
                    >
                      <div className="mb-3">
                        <p className="text-sm text-gray-500 mb-1">Descripción</p>
                        <p className="text-base font-semibold text-gray-900">
                          {req.description}
                        </p>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-500 mb-1">Cantidad</p>
                        <p className="text-base font-semibold text-gray-900">
                          {req.quantity}
                        </p>
                      </div>

                      {Object.keys(restSpecs).length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-2">Especificaciones</p>
                          <div className="grid md:grid-cols-2 gap-3">
                            {Object.entries(restSpecs).map(([key, value]) => (
                              <div
                                key={key}
                                className="bg-white rounded-lg p-3 border border-gray-200"
                              >
                                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                                  {key.replace(/_/g, " ")}
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {typeof value === "object" && value !== null
                                    ? JSON.stringify(value, null, 2)
                                    : String(value)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {normalizedImages.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-500 mb-3">Referencias visuales</p>
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {normalizedImages.map((image, index) => (
                              <div
                                key={`${req.id}-image-${index}`}
                                className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
                              >
                                <img
                                  src={image}
                                  alt={`Referencia ${index + 1} de ${req.description}`}
                                  className="h-48 w-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Especificaciones de tu oferta */}
          {offer?.specs_json && Object.keys(offer.specs_json).length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Especificaciones de tu oferta
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(offer.specs_json).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                      {key.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {typeof value === "object" && value !== null
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CompanyTrackOrderPage() {
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
