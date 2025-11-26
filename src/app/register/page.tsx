"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authService } from "@/lib/api/services/auth.service";
import { companiesService } from "@/lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<"client" | "company">("client");
  const [companyName, setCompanyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  // Redirigir si ya está logueado
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const isCompany = user.roleId === "692641d17ad15076fef187d1";
          router.replace(isCompany ? "/company/dashboard" : "/dashboard");
          return;
        } catch {
          // Si falla el parse, usar dashboard por defecto
        }
      }
      router.replace("/dashboard");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (accountType === "company" && !companyName) {
      setError("El nombre de la empresa es requerido");
      return;
    }

    if (accountType === "company" && !contactEmail) {
      setError("El email de contacto de la empresa es requerido");
      return;
    }

    setIsLoading(true);

    try {
      // Determinar el roleId según el tipo de cuenta
      const roleId = accountType === "company" 
        ? "692641d17ad15076fef187d1" // Company role
        : "691f378330abb9ac9bc28954"; // Client role

      // Crear usuario
      const user = await authService.createUser({
        name,
        email,
        password,
        roleId,
      });

      // Si es una compañía, crear el registro de compañía
      if (accountType === "company") {
        await companiesService.createCompany({
          userId: user.id,
          name: companyName,
          contactEmail: contactEmail,
        });
      }

      // Iniciar sesión automáticamente
      const authResponse = await authService.login({ email, password });

      // Guardar datos del usuario
      localStorage.setItem("userId", authResponse.userId);
      localStorage.setItem("userName", authResponse.name);
      localStorage.setItem("userEmail", authResponse.email);
      localStorage.setItem("userRole", authResponse.roleId);

      // Si es compañía, cargar y guardar el companyId
      if (accountType === "company") {
        try {
          const company = await companiesService.getCompanyByUserId(authResponse.userId);
          localStorage.setItem("companyId", company.id);
        } catch (err) {
          console.error("Error cargando companyId:", err);
        }
      }

      // Disparar evento personalizado
      window.dispatchEvent(new Event("loginStatusChanged"));

      // Redirigir según el tipo de cuenta
      router.replace(accountType === "company" ? "/company/dashboard" : "/dashboard");
    } catch (err: unknown) {
      const fallbackMessage = "Error al crear la cuenta. Intenta de nuevo.";
      setError(err instanceof Error ? err.message : fallbackMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar loading mientras verifica autenticación
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full"></div>
            <span className="text-2xl font-bold text-gray-800">MerchPrint</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:border-blue-500 hover:text-blue-500 transition-all"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-screen flex pt-20">
        {/* Left Section - 3D Illustration */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sky-300 via-blue-200 to-cyan-300 items-center justify-center relative overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src="/login-illustration.svg"
              alt="Register illustration"
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-cyan-300/20 rounded-full blur-xl"></div>
        </div>

        {/* Right Section - Register Form */}
        <div
          className="w-full lg:w-1/2 flex items-center justify-center p-8"
          style={{ backgroundColor: "#F0F8FF" }}
        >
          <div className="w-full max-w-md">
            {/* Register Form Container */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                ¡Crea tu cuenta!
              </h1>
              <p className="text-gray-500 mb-8">
                Únete a nosotros y comienza tu experiencia
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Account Type Selection */}
                <div className="flex gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setAccountType("client")}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                      accountType === "client"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Cliente
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType("company")}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                      accountType === "company"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Empresa
                  </button>
                </div>

                {/* Name Input */}
                <div>
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-6 py-4 bg-gray-100 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-800 placeholder:text-gray-500"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-6 py-4 bg-gray-100 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-800 placeholder:text-gray-500"
                  />
                </div>

                {/* Company-specific fields */}
                {accountType === "company" && (
                  <>
                    <div>
                      <input
                        type="text"
                        placeholder="Nombre de la empresa"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        className="w-full px-6 py-4 bg-gray-100 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-800 placeholder:text-gray-500"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email de contacto de la empresa"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        required
                        className="w-full px-6 py-4 bg-gray-100 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-800 placeholder:text-gray-500"
                      />
                    </div>
                  </>
                )}

                {/* Password Input */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-6 py-4 pr-12 bg-gray-100 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-800 placeholder:text-gray-500 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
                  >
                    {showPassword ? (
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Confirm Password Input */}
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmar contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-6 py-4 pr-12 bg-gray-100 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-800 placeholder:text-gray-500 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
                  >
                    {showConfirmPassword ? (
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creando cuenta...
                    </>
                  ) : (
                    "Crear cuenta"
                  )}
                </button>

                {/* Already have account */}
                <div className="text-center mt-6">
                  <p className="text-gray-600 text-sm">
                    ¿Ya tienes una cuenta?{" "}
                    <Link href="/login" className="text-blue-500 hover:text-blue-600 font-semibold">
                      Inicia sesión
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
