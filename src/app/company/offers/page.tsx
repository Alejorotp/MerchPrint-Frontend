"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { authService, offersService, eventsService } from "@/lib/api";
import type { OfferDTO, EventDTO } from "@/lib/api";

interface OfferWithEvent extends OfferDTO {
  event?: EventDTO;
}

export default function CompanyOffersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [offers, setOffers] = useState<OfferWithEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.replace("/login");
        return;
      }

      const companyId = localStorage.getItem("companyId");
      if (!companyId) {
        setError("No tienes una compañía asociada");
        setIsLoading(false);
        return;
      }

      await loadOffers(companyId);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const loadOffers = async (companyId: string) => {
    try {
      const offersData = await offersService.getOffersByCompanyId(companyId);

      // Cargar información del evento para cada oferta
      const offersWithEvents = await Promise.all(
        offersData.map(async (offer) => {
          try {
            // Obtener subasta para luego obtener el evento
            const auction = await eventsService.getAuctionById(offer.auction_id);
            if (auction?.event_id) {
              const event = await eventsService.getEventById(auction.event_id);
              return { ...offer, event };
            }
            return { ...offer };
          } catch (err) {
            console.error("Error cargando evento para oferta:", err);
            return { ...offer };
          }
        })
      );

      setOffers(offersWithEvents);
    } catch (err) {
      console.error("Error cargando ofertas:", err);
      setError("No se pudieron cargar las ofertas");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700" },
      accepted: { bg: "bg-green-100", text: "text-green-700" },
      rejected: { bg: "bg-red-100", text: "text-red-700" },
    };
    return colors[status] || { bg: "bg-gray-100", text: "text-gray-700" };
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
          <div className="mb-8">
            <Link
              href="/company/dashboard"
              className="inline-flex items-center text-blue-500 hover:text-blue-600 mb-4"
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
              Volver
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Mis Ofertas
            </h1>
            <p className="text-gray-600">Gestiona todas tus ofertas activas</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
              {error}
            </div>
          )}

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
                No tienes ofertas
              </h3>
              <p className="text-gray-600 mb-4">
                Aún no has creado ninguna oferta
              </p>
              <Link
                href="/company/dashboard"
                className="inline-block px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
              >
                Ver eventos disponibles
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {offers.map((offer) => {
                const statusColors = getStatusColor(offer.status);
                return (
                  <div
                    key={offer.id}
                    className="bg-white rounded-2xl shadow-sm p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {offer.event?.name || "Evento desconocido"}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Oferta #{offer.id.slice(-8)}
                        </p>
                        {offer.event && (
                          <p className="text-gray-500 text-sm">
                            📍 {offer.event.location} · 📅{" "}
                            {new Date(offer.event.date).toLocaleDateString("es-ES")}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-4 py-2 ${statusColors.bg} ${statusColors.text} rounded-full font-medium`}
                      >
                        {offer.status === "pending"
                          ? "Pendiente"
                          : offer.status === "accepted"
                          ? "Aceptada"
                          : offer.status === "rejected"
                          ? "Rechazada"
                          : offer.status}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Precio ofertado
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${offer.price.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Tiempo de entrega
                        </p>
                        <p className="text-xl font-semibold text-gray-900">
                          {offer.lead_time_days} días
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Fecha de creación
                        </p>
                        <p className="text-gray-900">
                          {new Date(offer.created_at).toLocaleDateString(
                            "es-ES"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
