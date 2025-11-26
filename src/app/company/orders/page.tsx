"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { authService, offersService } from "@/lib/api";
import type { OfferDTO } from "@/lib/api";

export default function CompanyOrdersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<OfferDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

      await loadCompanyOrders();
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
  }, [router]);

  const loadCompanyOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const companyId = localStorage.getItem("companyId");
      if (!companyId) {
        throw new Error("ID de compañía no encontrado");
      }

      // Obtener todas las ofertas aceptadas de la compañía
      const allOffers = await offersService.getOffersByCompanyId(companyId);
      const acceptedOffers = allOffers.filter(
        (offer) => offer.status === "accepted"
      );

      setOrders(acceptedOffers);
    } catch (err) {
      console.error("Error cargando órdenes:", err);
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar las órdenes"
      );
    } finally {
      setIsLoading(false);
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
              Mis Órdenes
            </h1>
            <p className="text-gray-600">
              Eventos donde tu oferta fue aceptada
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* Lista de órdenes */}
          {orders.length === 0 ? (
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
                No tienes órdenes activas
              </h3>
              <p className="text-gray-600 mb-6">
                Cuando un cliente acepte tu oferta, aparecerá aquí
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((offer) => (
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
                        Aceptada el{" "}
                        {new Date(offer.created_at).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <span className="px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-lg">
                      Aceptada
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Precio</p>
                      <p className="font-semibold text-gray-900">
                        ${offer.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Tiempo de entrega</p>
                      <p className="font-semibold text-gray-900">
                        {offer.lead_time_days} días
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        router.push(
                          `/company/orders/track?offerId=${offer.id}`
                        )
                      }
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                    >
                      Ver detalles completos
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
