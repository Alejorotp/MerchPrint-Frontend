"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [username, setUsername] = useState("Usuario");
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario está logueado
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const storedUsername = localStorage.getItem("username") || "Usuario";
    setIsLoggedIn(loggedIn);
    setUsername(storedUsername);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    setIsLoggedIn(false);

    // Disparar evento personalizado para notificar a otros componentes
    window.dispatchEvent(new Event("loginStatusChanged"));

    router.push("/");
  };

  // No renderizar nada hasta que sepamos el estado de autenticación
  if (isLoggedIn === null) {
    return (
      <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
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
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full"></div>
          <span className="text-2xl font-bold text-gray-800">MerchPrint</span>
        </Link>

        {isLoggedIn ? (
          // Usuario logueado - Mostrar perfil y búsqueda
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-blue-500 transition-colors">
              <svg
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
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="relative group">
              <button className="flex items-center space-x-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-gray-800">
                    {username}
                  </p>
                  <p className="text-xs text-gray-500">test@merchprint.com</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold hover:shadow-lg transition-all">
                  <svg
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
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link
                  href="/dashboard"
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-t-xl"
                >
                  Dashboard
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
                <button
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
