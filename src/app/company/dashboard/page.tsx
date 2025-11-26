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

      // Obtener subastas pendientes para cada evento
      const auctionsWithEvents: AuctionWithEvent[] = [];
      for (const event of allEvents) {
        try {
          const auction = await eventsService.getAuctionByEventId(event.id);
          if (auction && auction.status === "pending") {
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

  const statusConfig = {
    pending: {
      label: "Pendiente",
      color: "text-yellow-700",
      bgColor: "bg-yellow-100",
      gradient: "from-yellow-300 via-orange-400 to-yellow-300",
      shadow: "shadow-yellow-500/50",
      icon: "⏳",
    },
    active: {
      label: "Activa",
      color: "text-blue-700",
      bgColor: "bg-blue-100",
      gradient: "from-blue-400 via-cyan-400 to-blue-400",
      shadow: "shadow-blue-500/50",
      icon: "🔥",
    },
    ended: {
      label: "Finalizada",
      color: "text-green-700",
      bgColor: "bg-green-100",
      gradient: "from-green-400 via-emerald-500 to-green-400",
      shadow: "shadow-green-500/50",
      icon: "🏁",
    },
    cancelled: {
      label: "Cancelada",
      color: "text-red-700",
      bgColor: "bg-red-100",
      gradient: "from-red-500 via-pink-600 to-red-500",
      shadow: "shadow-red-500/50",
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
              Subastas Pendientes
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

          {/* Lista de subastas */}
          <div className="space-y-4">
            {auctions.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No hay subastas pendientes
                </h3>
                <p className="text-gray-600">
                  No hay subastas pendientes en este momento. Vuelve más tarde para ver nuevas oportunidades.
                </p>
              </div>
            ) : (
              auctions.map(({ auction, event }) => (
                <div
                  key={auction.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-6"
                >
                  <div className="flex gap-6">
                    <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-r ${statusConfig[auction.status as keyof typeof statusConfig]?.gradient ||
                          "from-gray-300 via-gray-400 to-gray-300"
                          } animate-pulse shadow-lg ${statusConfig[auction.status as keyof typeof statusConfig]?.shadow ||
                          "shadow-gray-500/50"
                          } ring-4 ring-white`}
                      />
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
                          className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig[auction.status as keyof typeof statusConfig]?.bgColor ||
                            "bg-gray-100"
                            } ${statusConfig[auction.status as keyof typeof statusConfig]?.color ||
                            "text-gray-700"
                            }`}
                        >
                          {statusConfig[auction.status as keyof typeof statusConfig]?.label ||
                            auction.status}
                        </span>
                      </div>

                      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 mb-1">
                            Precio sugerido
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            $
                            {auction.suggested_price?.toLocaleString("es-CO", {
                              maximumFractionDigits: 0,
                            }) || "0"}
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
