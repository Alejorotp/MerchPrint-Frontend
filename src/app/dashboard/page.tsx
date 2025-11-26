"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Proteger la ruta - solo usuarios logueados
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.replace("/login");
        return;
      }

      // Redirigir a compañías a su dashboard
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.roleId === "692641d17ad15076fef187d1") {
            router.replace("/company/dashboard");
            return;
          }
        } catch {
          // Ignorar error de parse
        }
      }

      setIsLoading(false);
    };

    checkAuth();

    // Escuchar cambios en el estado de login
    window.addEventListener("loginStatusChanged", checkAuth);

    return () => {
      window.removeEventListener("loginStatusChanged", checkAuth);
    };
  }, [router]);

  // Mostrar loading mientras verifica autenticación
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

  const eventCategories = [
    {
      name: "Bodas",
      icon: "💍",
      color: "from-pink-400 to-rose-400",
      description: "Productos personalizados para tu día especial",
    },
    {
      name: "Conciertos",
      icon: "🎵",
      color: "from-purple-400 to-indigo-400",
      description: "Merchandising para eventos musicales",
    },
    {
      name: "Conferencias",
      icon: "💼",
      color: "from-blue-400 to-cyan-400",
      description: "Material corporativo y promocional",
    },
    {
      name: "Fiestas infantiles",
      icon: "🎈",
      color: "from-yellow-400 to-orange-400",
      description: "Decoración y regalos personalizados",
    },
    {
      name: "Eventos deportivos",
      icon: "⚽",
      color: "from-green-400 to-emerald-400",
      description: "Uniformes y accesorios deportivos",
    },
    {
      name: "Graduaciones",
      icon: "🎓",
      color: "from-indigo-400 to-purple-400",
      description: "Recuerdos para celebrar tus logros",
    },
    {
      name: "Cumpleaños",
      icon: "🎂",
      color: "from-red-400 to-pink-400",
      description: "Celebra con estilo personalizado",
    },
    {
      name: "Festivales",
      icon: "🎪",
      color: "from-orange-400 to-red-400",
      description: "Productos únicos para festivales",
    },
    {
      name: "Eventos corporativos",
      icon: "🏢",
      color: "from-slate-400 to-blue-400",
      description: "Branding profesional para empresas",
    },
    {
      name: "Ferias y exposiciones",
      icon: "🎯",
      color: "from-teal-400 to-cyan-400",
      description: "Material promocional impactante",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Search Bar específica del dashboard */}
      <div className="fixed top-[73px] w-full bg-white shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="relative w-full max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Buscar por tipo de evento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-3 bg-gray-100 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-800 placeholder:text-gray-500"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full hover:shadow-lg transition-all"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-36 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  ¡Bienvenido de vuelta!
                </h1>
                <p className="text-xl opacity-90">
                  Crea tu orden personalizada para tu próximo evento
                </p>
              </div>
              <Link
                href="/dashboard/orders/new"
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:shadow-2xl transition-all transform hover:scale-105 inline-block"
              >
                + Crear nueva orden
              </Link>
            </div>
          </div>

          {/* Categories Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Categorías de eventos
            </h2>
            <p className="text-gray-600 mb-8">
              Selecciona el tipo de evento para tu orden personalizada
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {eventCategories.map((category) => (
                <Link
                  key={category.name}
                  href={`/dashboard/orders/new?category=${category.name
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden">
                    <div
                      className={`h-32 bg-gradient-to-br ${category.color} flex items-center justify-center`}
                    >
                      <span className="text-6xl group-hover:scale-110 transition-transform">
                        {category.icon}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
