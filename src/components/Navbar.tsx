"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { eventsService, offersService } from "@/lib/api";
import type { OfferDTO } from "@/lib/api";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [isCompany, setIsCompany] = useState(false);
  const [notifications, setNotifications] = useState<OfferDTO[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("accessToken");
      const loggedIn = !!token;

      if (loggedIn) {
        const userStr = localStorage.getItem("user");

        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            setUserEmail(user.email || "");

            // Determinar si es compañía por roleId
            const isCompanyRole = user.roleId === "692641d17ad15076fef187d1";
            setIsCompany(isCompanyRole);

            // Cargar notificaciones solo para clientes (no compañías)
            if (!isCompanyRole && user.id) {
              await loadNotifications(user.id);
            }
          } catch (e) {
            setUserEmail("");
          }
        }
      } else {
        setUserEmail("");
        setIsCompany(false);
        setNotifications([]);
      }

      setIsLoggedIn(loggedIn);
    };

    // Verificar estado inicial
    checkAuthStatus();

    // Escuchar cambios en el estado de login
    window.addEventListener("loginStatusChanged", checkAuthStatus);
    window.addEventListener("storage", checkAuthStatus);

    return () => {
      window.removeEventListener("loginStatusChanged", checkAuthStatus);
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, []);

  const loadNotifications = async (userId: string) => {
    try {
      // Obtener eventos del usuario
      const allEvents = await eventsService.getAllEvents();
      const userEvents = allEvents.filter((event) => event.userId === userId);

      // Obtener ofertas para los eventos del usuario
      const allOffers: OfferDTO[] = [];
      for (const event of userEvents) {
        if (event.auction?.id) {
          try {
            const offers = await offersService.getOffersByAuctionId(
              event.auction.id
            );
            if (Array.isArray(offers)) {
              allOffers.push(...offers);
            }
          } catch (err) {
            // Ignorar errores de eventos sin ofertas
          }
        }
      }

      // Ordenar por fecha y tomar las últimas 5
      const sortedOffers = allOffers
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 5);

      setNotifications(sortedOffers);
    } catch (err) {
      console.error("Error cargando notificaciones:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setUserEmail("");

    // Disparar evento personalizado para notificar a otros componentes
    window.dispatchEvent(new Event("loginStatusChanged"));

    router.push("/login");
  };

  const getHomeLink = () => {
    if (isLoggedIn === null) return "/"; // Mientras carga, usar ruta por defecto
    if (!isLoggedIn) return "/";
    return isCompany ? "/company/dashboard" : "/dashboard";
  };

  // No renderizar nada hasta que sepamos el estado de autenticación
  if (isLoggedIn === null) {
    return (
      <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href={getHomeLink()} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full"></div>
            <span className="text-2xl font-bold text-gray-800">MerchPrint</span>
          </Link>
          {/* Espacio vacío mientras carga */}
          <div className="w-64 h-10"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href={getHomeLink()} className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full"></div>
          <span className="text-2xl font-bold text-gray-800">MerchPrint</span>
        </Link>

        {isLoggedIn ? (
          // Usuario logueado - Mostrar perfil y búsqueda
          <div className="flex items-center space-x-4">
            {!isCompany && (
              <div className="relative">
                <button
                  type="button"
                  aria-label="Abrir notificaciones"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-blue-500 transition-colors"
                >
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {/* Dropdown de notificaciones */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">
                        Últimas ofertas
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          No hay ofertas nuevas
                        </div>
                      ) : (
                        notifications.map((offer) => (
                          <div
                            key={offer.id}
                            className="p-4 border-b border-gray-100 hover:bg-gray-50"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-sm font-semibold text-gray-900">
                                Nueva oferta
                              </p>
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded ${
                                  offer.status === "pending"
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
                            <p className="text-sm text-gray-600 mb-1">
                              Precio: ${offer.price.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              Entrega: {offer.lead_time_days} días
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(offer.created_at).toLocaleDateString(
                                "es-ES"
                              )}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <Link
                        href="/dashboard/orders"
                        onClick={() => setShowNotifications(false)}
                        className="block text-center text-sm text-blue-500 hover:text-blue-600 font-semibold"
                      >
                        Ver todas las solicitudes
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="relative group">
              <button type="button" className="flex items-center space-x-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-gray-800">
                    {userEmail}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold hover:shadow-lg transition-all">
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {isCompany ? (
                  <>
                    <Link
                      href="/company/dashboard"
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-t-xl"
                    >
                      Eventos disponibles
                    </Link>
                    <Link
                      href="/company/orders"
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
                    >
                      Mis órdenes
                    </Link>
                    <Link
                      href="/company/offers"
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
                    >
                      Mis ofertas
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
                    >
                      Mi perfil
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-t-xl"
                    >
                      Principal
                    </Link>
                    <Link
                      href="/dashboard/orders"
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
                    >
                      Mis órdenes
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
                    >
                      Mi perfil
                    </Link>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-b-xl"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Usuario no logueado - Mostrar menú normal
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#como-funciona"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Cómo funciona
            </Link>
            <Link
              href="#beneficios"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Beneficios
            </Link>
            <Link
              href="#empresas"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Para empresas
            </Link>
            <Link
              href="/login"
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-full hover:shadow-lg transition-all"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:border-blue-500 hover:text-blue-500 transition-all"
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
