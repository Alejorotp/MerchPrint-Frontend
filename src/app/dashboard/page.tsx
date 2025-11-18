"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Proteger la ruta - solo usuarios logueados
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      setIsLoading(false);
    }
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
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full hover:shadow-lg transition-all">
              <svg
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
              <button className="px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:shadow-2xl transition-all transform hover:scale-105">
                + Crear nueva orden
              </button>
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
              {eventCategories.map((category, index) => (
                <Link
                  key={index}
                  href={`/dashboard/orders/new?category=${category.name.toLowerCase()}`}
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

          {/* Featured Section */}
          <div className="mt-12">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-6 md:mb-0">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    ¿Primera vez en MerchPrint?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Descubre cómo funciona nuestra plataforma
                  </p>
                  <div className="flex space-x-4">
                    <Link
                      href="/tutorial"
                      className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-all"
                    >
                      Ver tutorial
                    </Link>
                    <Link
                      href="/help"
                      className="px-6 py-3 border-2 border-purple-600 text-purple-600 font-semibold rounded-full hover:bg-purple-600 hover:text-white transition-all"
                    >
                      Centro de ayuda
                    </Link>
                  </div>
                </div>
                <div className="text-6xl">📚</div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Órdenes activas</p>
                  <p className="text-3xl font-bold text-gray-900">0</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
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
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">
                    Ofertas recibidas
                  </p>
                  <p className="text-3xl font-bold text-gray-900">0</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">
                    Órdenes completadas
                  </p>
                  <p className="text-3xl font-bold text-gray-900">0</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
