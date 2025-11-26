"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { authService, eventsService, offersService } from "@/lib/api";
import type { EventDTO, OfferDTO, AuctionDTO } from "@/lib/api";

import { Suspense } from "react";

function EventOffersContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<EventDTO | null>(null);
  const [offers, setOffers] = useState<OfferDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams?.get("eventId");

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.replace("/login");
      } else {
        setIsLoading(false);
        if (eventId) {
          loadEventAndOffers();
        }
      }
    };

    checkAuth();

    window.addEventListener("loginStatusChanged", checkAuth);
    return () => {
      window.removeEventListener("loginStatusChanged", checkAuth);
    };
  }, [router, eventId]);

  const loadEventAndOffers = async () => {
    try {
      if (!eventId) return;

      // Cargar evento
      const eventData = await eventsService.getEventById(eventId);
      setEvent(eventData);

      // Cargar subasta del evento
      const auctionData = await eventsService.getAuctionByEventId(eventId);

      // Cargar ofertas si hay subasta
      if (auctionData?.id) {
        const offersData = await offersService.getOffersByAuctionId(
          auctionData.id
        );
        setOffers(Array.isArray(offersData) ? offersData : []);
      } else {
        setOffers([]);
      }
    } catch (err) {
      console.error("Error cargando evento:", err);
      setError("No se pudo cargar el evento");
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      setError(null);
      const currentUser = authService.getCurrentUser();
      await offersService.acceptOffer(offerId, currentUser!.id);
      setSuccessMessage("¡Oferta aceptada! Redirigiendo...");
      setTimeout(() => {
        router.push("/dashboard/orders");
      }, 2000);
    } catch (err: any) {
      console.error("Error aceptando oferta:", err);
      setError(err.message || "No se pudo aceptar la oferta");
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      setError(null);
      const currentUser = authService.getCurrentUser();
      await offersService.rejectOffer(offerId, currentUser!.id);
      // Recargar ofertas
      await loadEventAndOffers();
    } catch (err: any) {
      console.error("Error rechazando oferta:", err);
      setError(err.message || "No se pudo rechazar la oferta");
    }
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-blue-500 hover:text-blue-600 mb-4"
            >
              <svg
                className="w-5 h-5 mr-2"
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
              Volver a solicitudes
            </button>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Ofertas para: {event?.name || "Cargando..."}
            </h1>
            <p className="text-gray-600">
              Revisa y acepta las ofertas de las compañías
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-6">
              {successMessage}
            </div>
          )}

          {/* Lista de ofertas */}
          {offers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay ofertas disponibles
              </h3>
              <p className="text-gray-600">
                Las compañías aún no han enviado ofertas para este evento
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Oferta #{offer.id.slice(0, 8)}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Compañía: {offer.company_id}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 font-semibold rounded-lg ${offer.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : offer.status === "accepted"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {offer.status === "pending"
                        ? "Pendiente"
                        : offer.status === "accepted"
                          ? "Aceptada"
                          : "Rechazada"}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Precio</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${offer.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">
                        Tiempo de entrega
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {offer.lead_time_days} días
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">
                        Fecha de oferta
                      </p>
                      <p className="font-semibold text-gray-900">
                        {new Date(offer.created_at).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </div>

                  {offer.specs_json && (
                    <div className="border-t pt-4 mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        Detalles de la oferta
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid md:grid-cols-2 gap-3">
                          {Object.entries(offer.specs_json).map(([key, value]) => (
                            <div key={key} className="bg-white rounded-lg p-3 border border-gray-200">
                              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                                {key.replace(/_/g, ' ')}
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {typeof value === 'object' && value !== null
                                  ? JSON.stringify(value, null, 2)
                                  : String(value)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {offer.status === "pending" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAcceptOffer(offer.id)}
                        className="flex-1 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                      >
                        ✓ Aceptar oferta
                      </button>
                      <button
                        onClick={() => handleRejectOffer(offer.id)}
                        className="flex-1 px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                      >
                        ✗ Rechazar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EventOffersPage() {
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
      <EventOffersContent />
    </Suspense>
  );
}
