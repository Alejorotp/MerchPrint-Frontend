"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { authService, eventsService } from "@/lib/api";
import type { AuctionDTO, EventDTO, RequirementsDTO } from "@/lib/api";

interface RequirementDetails {
  id: string;
  description: string;
  quantity: number;
  specs: Record<string, unknown>;
  images: string[];
}

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatDate = (value: Date | string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Fecha desconocida";
  }
  return parsed.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateTime = (value: Date | string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }
  return parsed.toLocaleString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatSpecValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.map((item) => formatSpecValue(item)).join(", ");
  }
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }
  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }
  if (value === null || value === undefined) {
    return "-";
  }
  return String(value);
};

export default function AuctionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const auctionId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auction, setAuction] = useState<AuctionDTO | null>(null);
  const [eventData, setEventData] = useState<EventDTO | null>(null);
  const [requirements, setRequirements] = useState<RequirementDetails[]>([]);

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

      if (!auctionId) {
        setError("No se especificó una subasta.");
        setIsLoading(false);
        return;
      }

      await fetchData();
    };

    verify();
  }, [auctionId, router]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Obtener la subasta
      const auctionData = await eventsService.getAuctionById(auctionId);
      setAuction(auctionData);

      if (auctionData?.event_id) {
        // Obtener el evento y los requerimientos
        const [eventInfo, requirementsData] = await Promise.all([
          eventsService.getEventById(auctionData.event_id),
          eventsService.getRequirementsByEventId(auctionData.event_id),
        ]);

        setEventData(eventInfo);

        const parsedRequirements = (requirementsData ?? []).map(
          (req: RequirementsDTO): RequirementDetails => {
            const specs = req.specs_json ?? {};
            const { images, ...restSpecs } = specs as {
              images?: unknown;
              [key: string]: unknown;
            };
            const normalizedImages = Array.isArray(images)
              ? images.filter((img): img is string => typeof img === "string")
              : [];

            return {
              id: req.id,
              description: req.description,
              quantity: req.quantity,
              specs: restSpecs,
              images: normalizedImages,
            };
          }
        );

        setRequirements(parsedRequirements);
      }
    } catch (err) {
      console.error("Error cargando la información:", err);
      setError("No pudimos cargar los detalles de la subasta.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="px-6 pb-12 pt-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Detalles de la subasta
              </h1>
              <p className="text-gray-600">
                Revisa toda la información del evento antes de enviar tu oferta
              </p>
            </div>
            <Link
              href="/company/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:border-blue-400 hover:text-blue-600"
            >
              ← Volver al dashboard
            </Link>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">
              {error}
            </div>
          ) : (
            <div className="space-y-8">
              {eventData && auction && (
                <section className="rounded-3xl bg-white p-8 shadow-sm">
                  <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                    Información del evento
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-500">Nombre</p>
                      <p className="text-lg font-medium text-gray-900">
                        {eventData.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fecha del evento</p>
                      <p className="text-lg font-medium text-gray-900">
                        {formatDate(eventData.date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ubicación</p>
                      <p className="text-lg font-medium text-gray-900">
                        {eventData.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Precio sugerido</p>
                      <p className="text-lg font-medium text-gray-900">
                        {currencyFormatter.format(auction.suggested_price)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
                      Estado de la subasta
                    </p>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-gray-500">Estado</p>
                        <p className="text-base font-semibold text-gray-900">
                          {{
                            pending: "Pendiente",
                            active: "Activa",
                            ended: "Finalizada",
                            cancelled: "Cancelada",
                          }[auction.status] || auction.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Inicio</p>
                        <p className="text-base font-medium text-gray-900">
                          {formatDateTime(auction.start_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Cierre</p>
                        <p className="text-base font-medium text-gray-900">
                          {formatDateTime(auction.end_at)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link
                        href={`/company/auctions/${auctionId}/offer`}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02] hover:shadow-lg"
                      >
                        Enviar oferta
                      </Link>
                    </div>
                  </div>
                </section>
              )}

              <section className="rounded-3xl bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-2xl font-semibold text-gray-900">
                  Requerimientos del cliente
                </h2>

                {requirements.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
                    <div className="mb-3 text-4xl">📝</div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      No hay requisitos registrados
                    </h3>
                    <p className="text-gray-600">
                      El cliente aún no ha especificado los detalles de lo que necesita.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {requirements.map((requirement) => (
                      <article
                        key={requirement.id}
                        className="rounded-2xl border border-gray-100 p-6 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {requirement.description}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Cantidad solicitada: {requirement.quantity}{" "}
                              unidades
                            </p>
                          </div>
                        </div>

                        {Object.keys(requirement.specs).length > 0 && (
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {Object.entries(requirement.specs).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="rounded-xl bg-gray-50 p-4"
                                >
                                  <p className="text-xs uppercase tracking-wide text-gray-500">
                                    {key.replace(/_/g, " ")}
                                  </p>
                                  <p className="mt-1 text-sm font-medium text-gray-900">
                                    {formatSpecValue(value)}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {requirement.images.length > 0 && (
                          <div className="mt-6">
                            <p className="mb-3 text-sm font-semibold text-gray-700">
                              Referencias visuales
                            </p>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {requirement.images.map((image, index) => (
                                <div
                                  key={`${requirement.id}-image-${index}`}
                                  className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100"
                                >
                                  <img
                                    src={image}
                                    alt={`Referencia ${index + 1} de ${
                                      requirement.description
                                    }`}
                                    className="h-48 w-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
