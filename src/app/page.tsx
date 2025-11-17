"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      title: "Crea tu orden personalizada",
      description: "Diseña productos únicos para tu evento al por mayor",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Recibe ofertas competitivas",
      description: "Múltiples compañías compiten por tu pedido",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Elige precio o velocidad",
      description: "Tú decides qué es más importante para ti",
      color: "from-orange-500 to-yellow-500",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full"></div>
            <span className="text-2xl font-bold text-gray-800">MerchPrint</span>
          </div>
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
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Descubre tu próxima
          </h1>
          <h2 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent mb-8">
            orden personalizada
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            La plataforma que conecta tus eventos con las mejores compañías de
            impresión. Recibe ofertas competitivas y elige entre precio o
            velocidad.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/login"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-full hover:shadow-2xl transition-all transform hover:scale-105"
            >
              Crear orden ahora
            </Link>
            <Link
              href="#como-funciona"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-full hover:border-blue-500 hover:text-blue-500 transition-all"
            >
              Ver cómo funciona
            </Link>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center space-x-3 mt-16">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-3 rounded-full transition-all ${
                  currentSlide === index
                    ? "w-12 bg-yellow-500"
                    : "w-3 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Carousel */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative h-96 overflow-hidden rounded-3xl">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ${
                  currentSlide === index
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-full"
                }`}
              >
                <div
                  className={`w-full h-full bg-gradient-to-br ${feature.color} flex items-center justify-center text-white p-12 rounded-3xl`}
                >
                  <div className="text-center">
                    <h3 className="text-4xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-xl opacity-90">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Cómo funciona
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Crea tu orden
              </h3>
              <p className="text-gray-600">
                Describe tu evento, sube tu diseño y especifica la cantidad de
                productos que necesitas.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Recibe ofertas
              </h3>
              <p className="text-gray-600">
                Las compañías compiten por tu pedido ofreciéndote diferentes
                combinaciones de precio y tiempo de entrega.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Elige y recibe
              </h3>
              <p className="text-gray-600">
                Compara ofertas, elige la que mejor se ajuste a tus necesidades
                y recibe tus productos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section
        id="beneficios"
        className="py-20 px-6 bg-gradient-to-br from-blue-50 to-cyan-50"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            ¿Por qué elegir MerchPrint?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Precios competitivos
              </h3>
              <p className="text-gray-600">
                Las compañías compiten entre sí, garantizándote las mejores
                ofertas del mercado.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Entrega rápida
              </h3>
              <p className="text-gray-600">
                Elige entre velocidad o precio según las necesidades de tu
                evento.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
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
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Calidad garantizada
              </h3>
              <p className="text-gray-600">
                Solo trabajamos con compañías verificadas y con reputación
                comprobada.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Al por mayor
              </h3>
              <p className="text-gray-600">
                Especialistas en pedidos grandes para eventos, bodas,
                conferencias y más.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA for Companies */}
      <section
        id="empresas"
        className="py-20 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            ¿Tienes una empresa de impresión?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a nuestra red de proveedores y accede a cientos de clientes
            potenciales cada mes.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:shadow-2xl transition-all transform hover:scale-105"
          >
            Registrar mi empresa
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full"></div>
            <span className="text-2xl font-bold">MerchPrint</span>
          </div>
          <p className="text-gray-400 mb-4">
            La plataforma líder para pedidos personalizados al por mayor
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 MerchPrint. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
