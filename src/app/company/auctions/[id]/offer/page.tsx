"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { authService, eventsService, offersService } from "@/lib/api";
import type { AuctionDTO, EventDTO, RequirementsDTO } from "@/lib/api";

export default function CreateOfferPage() {
  const router = useRouter();
  const params = useParams();
  const auctionId = params.auctionId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auction, setAuction] = useState<AuctionDTO | null>(null);
  const [event, setEvent] = useState<EventDTO | null>(null);
  const [requirements, setRequirements] = useState<RequirementsDTO[]>([]);

  const [price, setPrice] = useState("");
  const [leadTimeDays, setLeadTimeDays] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
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

        // Cargar información de la subasta
        const allEvents = await eventsService.getAllEvents();
        let foundAuction: AuctionDTO | null = null;
        let foundEvent: EventDTO | null = null;

        for (const evt of allEvents) {
          const auc = await eventsService.getAuctionByEventId(evt.id);
          if (auc?.id === auctionId) {
            foundAuction = auc;
            foundEvent = evt;
            break;
          }
        }

        if (!foundAuction || !foundEvent) {
          setError("No se encontró la subasta");
          setIsLoading(false);
          return;
        }

        setAuction(foundAuction);
        setEvent(foundEvent);

        // Cargar requisitos
        const reqs = await eventsService.getRequirementsByEventId(
          foundEvent.id
        );
        setRequirements(Array.isArray(reqs) ? reqs : []);

        setIsLoading(false);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("No se pudo cargar la información de la subasta");
        setIsLoading(false);
      }
    };

    loadData();
  }, [auctionId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNum = Number(price);
    const leadTimeDaysNum = Number(leadTimeDays);

    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError("Ingresa un precio válido");
      return;
    }

    if (!Number.isFinite(leadTimeDaysNum) || leadTimeDaysNum <= 0) {
      setError("Ingresa un tiempo de entrega válido");
      return;
    }

    try {
      setIsSubmitting(true);

      let companyId = localStorage.getItem("companyId");

      // Si no hay companyId guardado, intentar cargarlo
      if (!companyId) {
        const currentUser = authService.getCurrentUser();
        if (currentUser?.id) {
          try {
            const { companiesService } = await import("@/lib/api");
            const company = await companiesService.getCompanyByUserId(
              currentUser.id
            );
            companyId = company.id;
            localStorage.setItem("companyId", companyId);
          } catch (companyErr) {
            console.error("Error obteniendo companyId:", companyErr);
            throw new Error(
              "No se pudo encontrar tu compañía. Asegúrate de tener una compañía registrada."
            );
          }
        } else {
          throw new Error(
            "Usuario no identificado. Por favor, inicia sesión nuevamente."
          );
        }
      }

      await offersService.createOffer({
        auction_id: auctionId,
        company_id: companyId,
        price: priceNum,
        lead_time_days: leadTimeDaysNum,
        specs_json: { notes },
      });

      router.push("/company/offers?created=1");
    } catch (err) {
      console.error("Error creando oferta:", err);
      setError(
        err instanceof Error ? err.message : "No se pudo crear la oferta"
      );
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              href="/company/dashboard"
              className="inline-flex items-center text-blue-500 hover:text-blue-600 mb-4"
            >
              ← Volver a subastas
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Enviar oferta
            </h1>
            <p className="text-gray-600">
              Completa los detalles de tu oferta para este evento
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {event && auction && (
            <div className="space-y-6">
              {/* Información del evento */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {event.name}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Ubicación</p>
                    <p className="font-medium text-gray-900">
                      {event.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha del evento</p>
                    <p className="font-medium text-gray-900">
                      {new Date(event.date).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Precio sugerido</p>
                    <p className="font-medium text-gray-900">
                      ${auction.suggested_price.toLocaleString("es-CO")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cierre de subasta</p>
                    <p className="font-medium text-gray-900">
                      {new Date(auction.end_at).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Requisitos */}
              {requirements.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Requisitos del evento
                  </h3>
                  <div className="space-y-3">
                    {requirements.map((req) => (
                      <div
                        key={req.id}
                        className="border-l-4 border-blue-500 pl-4"
                      >
                        <p className="font-medium text-gray-900">
                          {req.description}
                        </p>
                        <p className="text-sm text-gray-600">
                          Cantidad: {req.quantity} unidades
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulario de oferta */}
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tu oferta
                </h3>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Precio total (COP) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="price"
                      type="number"
                      min="1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      placeholder="Ej: 500000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="leadTime"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Tiempo de entrega (días){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="leadTime"
                      type="number"
                      min="1"
                      value={leadTimeDays}
                      onChange={(e) => setLeadTimeDays(e.target.value)}
                      required
                      placeholder="Ej: 15"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="notes"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Notas adicionales
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      placeholder="Añade detalles sobre tu oferta, materiales, etc."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Enviando..." : "Enviar oferta"}
                  </button>
                  <Link
                    href="/company/dashboard"
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-500 transition-all"
                  >
                    Cancelar
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
