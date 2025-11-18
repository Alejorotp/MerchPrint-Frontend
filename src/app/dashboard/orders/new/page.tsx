"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function CreateOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Datos del evento
  const [eventType, setEventType] = useState(categoryFromUrl || "");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");

  // Datos de requerimientos
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [productType, setProductType] = useState("");
  const [size, setSize] = useState("");
  const [colors, setColors] = useState("");
  const [material, setMaterial] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  // Proteger la ruta
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const eventTypes = [
    { value: "bodas", label: "💍 Bodas", icon: "💍" },
    { value: "conciertos", label: "🎵 Conciertos", icon: "🎵" },
    { value: "conferencias", label: "💼 Conferencias", icon: "💼" },
    { value: "fiestas-infantiles", label: "🎈 Fiestas infantiles", icon: "🎈" },
    { value: "eventos-deportivos", label: "⚽ Eventos deportivos", icon: "⚽" },
    { value: "graduaciones", label: "🎓 Graduaciones", icon: "🎓" },
    { value: "cumpleaños", label: "🎂 Cumpleaños", icon: "🎂" },
    { value: "festivales", label: "🎪 Festivales", icon: "🎪" },
    {
      value: "eventos-corporativos",
      label: "🏢 Eventos corporativos",
      icon: "🏢",
    },
    {
      value: "ferias-y-exposiciones",
      label: "🎯 Ferias y exposiciones",
      icon: "🎯",
    },
  ];

  const productTypes = [
    "Camisetas",
    "Gorras",
    "Tazas",
    "Stickers",
    "Banners",
    "Volantes",
    "Invitaciones",
    "Bolsas",
    "Llaveros",
    "Otros",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("No se encontró el ID del usuario");
      }

      // 1. Preparar datos del evento
      const eventData = {
        userId: userId,
        name: eventName,
        date: new Date(eventDate),
        location: eventLocation,
      };

      // 2. Preparar specs_json con tipo de evento como primera clave
      const specsJson = {
        eventType: eventType, // Primera clave: tipo de evento
        productType: productType,
        size: size,
        colors: colors,
        material: material,
        additionalInfo: additionalInfo,
      };

      // 3. Preparar datos de requerimientos
      const requirementsData = {
        description: description,
        quantity: parseInt(quantity),
        specs_json: specsJson,
      };

      // TODO: Aquí conectarás con tu API
      // Flujo:
      // 1. POST /events - Crear evento
      // 2. POST /requirements - Crear requerimientos (con eventId del paso 1)
      // 3. POST /auctions - Crear subasta (con event_id del paso 1)
      // 4. Las compañías verán la subasta y podrán hacer ofertas

      console.log("Datos a enviar:", {
        event: eventData,
        requirements: requirementsData,
      });

      // Simulación temporal - guardar localmente
      const newOrder = {
        id: `ORD-${Date.now()}`,
        userId: userId,
        eventType: eventType,
        quantity: parseInt(quantity),
        status: "pending",
        createdAt: new Date().toISOString(),
        eventName: eventName,
        description: description,
      };

      // Actualizar órdenes en localStorage
      const storedOrders = localStorage.getItem("userOrders");
      const orders = storedOrders ? JSON.parse(storedOrders) : [];
      orders.unshift(newOrder);
      localStorage.setItem("userOrders", JSON.stringify(orders));

      // Redirigir a mis órdenes
      router.push("/dashboard/orders");
    } catch (error) {
      console.error("Error al crear la orden:", error);
      alert("Hubo un error al crear la orden. Por favor intenta de nuevo.");
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
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-blue-500 hover:text-blue-600 mb-4"
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
              Volver al inicio
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Crear nueva orden
            </h1>
            <p className="text-gray-600">
              Completa los detalles de tu evento y los productos que necesitas
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sección: Información del Evento */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-sm">
                  1
                </span>
                Información del evento
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de evento <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                  >
                    <option value="">Selecciona un tipo de evento</option>
                    {eventTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del evento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    required
                    placeholder="Ej: Boda de María y Juan"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha del evento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ubicación <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      required
                      placeholder="Ej: Bogotá, Colombia"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección: Requerimientos del Producto */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mr-3 text-sm">
                  2
                </span>
                Detalles del producto
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción general <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    placeholder="Describe lo que necesitas para tu evento..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de producto <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                    >
                      <option value="">Selecciona un producto</option>
                      {productTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                      min="1"
                      placeholder="Ej: 100"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tamaño/Dimensiones
                    </label>
                    <input
                      type="text"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      placeholder="Ej: M, L, XL o 10x15cm"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Colores
                    </label>
                    <input
                      type="text"
                      value={colors}
                      onChange={(e) => setColors(e.target.value)}
                      placeholder="Ej: Azul, Blanco, Rojo"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material
                  </label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="Ej: Algodón, Poliéster, Papel"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Información adicional
                  </label>
                  <textarea
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    rows={3}
                    placeholder="Agrega cualquier detalle adicional que consideres importante..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Información importante */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    ¿Qué pasa después?
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • Tu orden será publicada para que las compañías puedan
                      verla
                    </li>
                    <li>
                      • Recibirás ofertas con diferentes precios y tiempos de
                      entrega
                    </li>
                    <li>
                      • Podrás comparar y elegir la mejor opción para tu evento
                    </li>
                    <li>
                      • Una vez aceptes una oferta, la compañía comenzará a
                      trabajar en tu pedido
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4 justify-end">
              <Link
                href="/dashboard"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-500 transition-all"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creando orden...
                  </>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Crear orden
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
