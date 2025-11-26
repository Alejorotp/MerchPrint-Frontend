"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { authService, eventsService, offersService } from "@/lib/api";
import type { EventDTO, RequirementsDTO } from "@/lib/api";

export default function EventDetailPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<EventDTO | null>(null);
  const [requirements, setRequirements] = useState<RequirementsDTO[]>([]);
  const [auctionId, setAuctionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  // Formulario de oferta
  const [price, setPrice] = useState("");
  const [leadTimeDays, setLeadTimeDays] = useState("");

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      const companyId = localStorage.getItem("companyId");
      if (!token || !companyId) {
        router.replace("/login");
      } else {
        setIsLoading(false);
        loadEventDetails();
      }
    };

    checkAuth();

    window.addEventListener("loginStatusChanged", checkAuth);
    return () => {
      window.removeEventListener("loginStatusChanged", checkAuth);
    };
  }, [router, eventId]);

  const loadEventDetails = async () => {
    try {
      if (!eventId) return;

      // Cargar evento
      const eventData = await eventsService.getEventById(eventId);
      setEvent(eventData);

      // Cargar subasta del evento
      const auctionData = await eventsService.getAuctionByEventId(eventId);
      if (auctionData) {
        setAuctionId(auctionData.id);
      }

      // Cargar requisitos
      const requirementsData = await eventsService.getRequirementsByEventId(
        eventId
      );
      setRequirements(Array.isArray(requirementsData) ? requirementsData : []);
    } catch (err) {
      console.error("Error cargando detalles del evento:", err);
      setError("No se pudieron cargar los detalles del evento");
    }
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const companyId = localStorage.getItem("companyId");
      if (!companyId) {
        throw new Error("ID de compañía no encontrado");
      }

      if (!auctionId) {
        throw new Error("No hay subasta disponible para este evento");
      }

      // Crear objeto specs_json con los requisitos
      const specs_json: any = {};
      requirements.forEach((req, index) => {
        specs_json[`requirement_${index + 1}`] = req.specs_json;
      });

      await offersService.createOffer({
        auction_id: auctionId,
        company_id: companyId,
        price: parseFloat(price),
        lead_time_days: parseInt(leadTimeDays),
        specs_json,
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        router.push("/company/offers");
      }, 2000);
    } catch (err: any) {
      console.error("Error creando oferta:", err);
      setError(err.message || "No se pudo crear la oferta");
    } finally {
      setIsSubmitting(false);
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

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <p className="text-gray-600">Evento no encontrado</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
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
              Volver
            </button>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {event.name}
            </h1>
            <p className="text-gray-600">Crea tu oferta para este evento</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-6">
              ¡Oferta creada exitosamente! Redirigiendo...
            </div>
          )}

          {/* Detalles del evento */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Detalles del Evento
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Fecha</p>
                <p className="font-semibold text-gray-900">
                  {new Date(event.date).toLocaleDateString("es-ES")}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Ubicación</p>
                <p className="font-semibold text-gray-900">{event.location}</p>
              </div>
            </div>
          </div>

          {/* Requisitos */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Requisitos ({requirements.length})
            </h2>
            {requirements.length === 0 ? (
              <p className="text-gray-600">
                No hay requisitos para este evento
              </p>
            ) : (
              <div className="space-y-4">
                {requirements.map((req, index) => (
                  <div
                    key={req.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Requisito {index + 1}
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                        {JSON.stringify(req.specs_json, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulario de oferta */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Crear Oferta
            </h2>
            <form onSubmit={handleSubmitOffer} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Total (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Ej: 1500.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de Entrega (días)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Ej: 15"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creando oferta..." : "Crear Oferta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
