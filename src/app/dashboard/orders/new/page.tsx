"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { authService, eventsService } from "@/lib/api";

export default function CreateOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
  const [budget, setBudget] = useState("");

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
    setFormError(null);
    setIsSubmitting(true);

    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser?.id) {
        throw new Error("Debes iniciar sesión antes de crear una orden.");
      }
      const eventDateValue = new Date(eventDate);
      if (Number.isNaN(eventDateValue.getTime())) {
        throw new Error("Selecciona una fecha de evento válida.");
      }

      const quantityNumber = Number(quantity);
      if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
        throw new Error("La cantidad debe ser un número mayor a cero.");
      }

      const budgetNumber = Number(budget);
      if (!Number.isFinite(budgetNumber) || budgetNumber <= 0) {
        throw new Error("Ingresa un presupuesto estimado válido.");
      }

      const eventPayload = {
        userId: currentUser.id,
        name: eventName,
        date: eventDateValue.toISOString(),
        location: eventLocation,
      };

      const createdEvent = await eventsService.createEvent(eventPayload);

      const specsJson: Record<string, unknown> = {
        eventType,
        productType,
      };
      if (size) specsJson.size = size;
      if (colors) specsJson.colors = colors;
      if (material) specsJson.material = material;
      if (additionalInfo) specsJson.additionalInfo = additionalInfo;

      await eventsService.createRequirements(createdEvent.id, {
        description,
        quantity: quantityNumber,
        specs_json: specsJson,
      });

      await eventsService.createAuction({
        event_id: createdEvent.id,
        start_at: new Date().toISOString(),
        end_at: eventDateValue.toISOString(),
        suggested_price: budgetNumber,
      });

      router.push("/dashboard/orders?created=1");
    } catch (error) {
      console.error("Error al crear la orden:", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "Hubo un error al crear la orden. Intenta nuevamente.",
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
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-blue-500 hover:text-blue-600 mb-4"
            >
              <svg
                aria-hidden="true"
                focusable="false"
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
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {formError}
              </div>
            )}

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
                  <label
                    htmlFor="event-type"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tipo de evento <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="event-type"
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
                  <label
                    htmlFor="event-name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nombre del evento <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="event-name"
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
                    <label
                      htmlFor="event-date"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Fecha del evento <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="event-date"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="event-location"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Ubicación <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="event-location"
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
                  <label
                    htmlFor="event-description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Descripción general <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="event-description"
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
                    <label
                      htmlFor="product-type"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Tipo de producto <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="product-type"
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
                    <label
                      htmlFor="product-quantity"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Cantidad <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="product-quantity"
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

                <div>
                  <label
                    htmlFor="product-budget"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Presupuesto estimado (USD){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="product-budget"
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    required
                    min="1"
                    step="0.01"
                    placeholder="Ej: 500"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="product-size"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Tamaño/Dimensiones
                    </label>
                    <input
                      id="product-size"
                      type="text"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      placeholder="Ej: M, L, XL o 10x15cm"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="product-colors"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Colores
                    </label>
                    <input
                      id="product-colors"
                      type="text"
                      value={colors}
                      onChange={(e) => setColors(e.target.value)}
                      placeholder="Ej: Azul, Blanco, Rojo"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="product-material"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Material
                  </label>
                  <input
                    id="product-material"
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="Ej: Algodón, Poliéster, Papel"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
                  />
                </div>

                <div>
                  <label
                    htmlFor="additional-info"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Información adicional
                  </label>
                  <textarea
                    id="additional-info"
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
                    aria-hidden="true"
                    focusable="false"
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
