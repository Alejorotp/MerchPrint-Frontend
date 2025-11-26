"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { authService, eventsService } from "@/lib/api";
import type { AuctionDTO, EventDTO } from "@/lib/api";

interface AuctionWithEvent {
  auction: AuctionDTO;
  event: EventDTO;
}

export default function CompanyDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [auctions, setAuctions] = useState<AuctionWithEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "pending">("active");

  const loadAuctions = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const currentUser = authService.getCurrentUser();
      if (
        !currentUser?.roleId ||
        currentUser.roleId !== "692641d17ad15076fef187d1"
      ) {
        throw new Error("Acceso no autorizado");
      }

      // Obtener todos los eventos
      const allEvents = await eventsService.getAllEvents();

      // Obtener subastas para cada evento
      const auctionsWithEvents: AuctionWithEvent[] = [];
      for (const event of allEvents) {
        try {
          const auction = await eventsService.getAuctionByEventId(event.id);
          if (auction) {
            auctionsWithEvents.push({ auction, event });
          }
        } catch {
          // Evento sin subasta, continuar
        }
      }

      setAuctions(auctionsWithEvents);
    } catch (error) {
      console.error("Error cargando subastas:", error);
      setError(
        error instanceof Error
          ? error.message
          : "No pudimos cargar las subastas disponibles."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const verifyAndFetch = async () => {
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

      await loadAuctions();
    };

    verifyAndFetch();

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
  }, [router, loadAuctions]);

  const filteredAuctions = auctions.filter((item) => {
    if (filter === "all") return true;
    return item.auction.status === filter;
  });

  const statusConfig = {
    pending: {
      label: "Pendiente",
      color: "text-yellow-700",
      bgColor: "bg-yellow-100",
      icon: "⏳",
    },
    active: {
      label: "Activa",
      color: "text-green-700",
      bgColor: "bg-green-100",
      icon: "🔥",
    },
    ended: {
      label: "Finalizada",
      color: "text-gray-700",
      bgColor: "bg-gray-100",
      icon: "🏁",
    },
    cancelled: {
      label: "Cancelada",
      color: "text-red-700",
      bgColor: "bg-red-100",
      icon: "❌",
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
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Subastas disponibles
            </h1>
            <p className="text-gray-600">
              Encuentra eventos que necesitan tus servicios y envía tu mejor
              oferta
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Filtros */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-6 py-2 rounded-xl font-medium transition-all ${
                  filter === "all"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Todas ({auctions.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("active")}
                className={`px-6 py-2 rounded-xl font-medium transition-all ${
                  filter === "active"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Activas (
                {auctions.filter((a) => a.auction.status === "active").length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("pending")}
                className={`px-6 py-2 rounded-xl font-medium transition-all ${
                  filter === "pending"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Pendientes (
                {auctions.filter((a) => a.auction.status === "pending").length})
              </button>
            </div>
          </div>

          {/* Lista de subastas */}
          <div className="space-y-4">
            {filteredAuctions.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No hay subastas disponibles
                </h3>
                <p className="text-gray-600">
                  {filter === "all"
                    ? "Aún no hay eventos con subastas activas"
                    : `No hay subastas ${
                        filter === "active" ? "activas" : "pendientes"
                      } en este momento`}
                </p>
              </div>
            ) : (
              filteredAuctions.map(({ auction, event }) => (
                <div
                  key={auction.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-6"
                >
                  <div className="flex gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">
                        {statusConfig[auction.status].icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {event.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            📍 {event.location} · 📅{" "}
                            {new Date(event.date).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            statusConfig[auction.status].bgColor
                          } ${statusConfig[auction.status].color}`}
                        >
                          {statusConfig[auction.status].label}
                        </span>
                      </div>

                      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-1">
                            Precio sugerido
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            $
                            {auction.suggested_price.toLocaleString("es-CO", {
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-1">Inicia</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(auction.start_at).toLocaleDateString(
                              "es-ES"
                            )}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-1">Cierra</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(auction.end_at).toLocaleDateString(
                              "es-ES"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/company/auctions/${auction.id}/offer`}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                        >
                          Enviar oferta
                        </Link>
                        <Link
                          href={`/company/auctions/${auction.id}/details`}
                          className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-500 transition-all"
                        >
                          Ver detalles
                        </Link>
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
