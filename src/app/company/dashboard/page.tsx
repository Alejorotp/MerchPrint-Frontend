"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { authService, eventsService, ordersService } from "@/lib/api";
import type { EventDTO, AuctionDTO } from "@/lib/api";

interface AvailableEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  auction?: AuctionDTO;
  requirementsCount: number;
}

export default function CompanyDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [availableEvents, setAvailableEvents] = useState<AvailableEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.replace("/login");
      } else {
        setIsLoading(false);
        loadAvailableEvents();
      }
    };

    checkAuth();

    window.addEventListener("loginStatusChanged", checkAuth);
    return () => {
      window.removeEventListener("loginStatusChanged", checkAuth);
    };
  }, [router]);

  const loadAvailableEvents = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser?.id) {
        throw new Error("Usuario no autenticado");
      }

      // Obtener todos los eventos
      const allEvents = await eventsService.getAllEvents();

      // Por ahora, mostrar todos los eventos
      // TODO: Implementar filtro de eventos disponibles cuando el backend tenga endpoint
      const eventsWithoutOrders = allEvents;

      // Cargar requisitos para cada evento
      const eventsData = await Promise.all(
        eventsWithoutOrders.map(async (event) => {
          try {
            const requirements = await eventsService.getRequirementsByEventId(
              event.id
            );
            return {
              id: event.id,
              name: event.name,
              date: new Date(event.date).toLocaleDateString("es-ES"),
              location: event.location,
              requirementsCount: Array.isArray(requirements)
                ? requirements.length
                : 0,
            };
          } catch (err) {
            return {
              id: event.id,
              name: event.name,
              date: new Date(event.date).toLocaleDateString("es-ES"),
              location: event.location,
              requirementsCount: 0,
            };
          }
        })
      );

      setAvailableEvents(eventsData);
    } catch (err) {
      console.error("Error cargando eventos disponibles:", err);
      setError("No se pudieron cargar los eventos disponibles");
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Eventos Disponibles
            </h1>
            <p className="text-gray-600">
              Explora los eventos y crea ofertas para participar
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* Lista de eventos */}
          {availableEvents.length === 0 ? (
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay eventos disponibles
              </h3>
              <p className="text-gray-600">
                No hay eventos activos en este momento
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      {event.name}
                    </h3>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      Disponible
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {event.date}
                    </div>
                    <div className="flex items-center text-gray-600">
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {event.location}
                    </div>
                    <div className="flex items-center text-gray-600">
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
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      {event.requirementsCount} requisito
                      {event.requirementsCount !== 1 ? "s" : ""}
                    </div>
                  </div>

                  <Link
                    href={`/company/events/${event.id}`}
                    className="block w-full text-center px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Ver detalles y ofertar
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
