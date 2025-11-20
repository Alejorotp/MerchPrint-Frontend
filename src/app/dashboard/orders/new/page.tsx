"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { authService, eventsService } from "@/lib/api";

interface Requirement {
  productType: string;
  description: string;
  quantity: number;
  specs: {
    color?: string;
    size?: string;
    material?: string;
  };
  images: string[];
}

const productTypeLabels: Record<string, string> = {
  camisetas: "Camisetas",
  gorras: "Gorras",
  posters: "Pósters",
  tazas: "Tazas",
  otro: "Otro",
};

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

  // Múltiples requerimientos
  const [requirements, setRequirements] = useState<Requirement[]>([
    {
      productType: "camisetas",
      description: "",
      quantity: 0,
      specs: {},
      images: [],
    },
  ]);

  // Proteger la ruta
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
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

  const addRequirement = () => {
    setRequirements([
      ...requirements,
      {
        productType: "camisetas",
        description: "",
        quantity: 0,
        specs: {},
        images: [],
      },
    ]);
  };

  const removeRequirement = (index: number) => {
    if (requirements.length > 1) {
      const updated = requirements.filter((_, i) => i !== index);
      setRequirements(updated);
    }
  };

  const updateRequirement = (
    index: number,
    field: keyof Requirement,
    value: string | number | Record<string, unknown>
  ) => {
    const updated = [...requirements];
    (updated[index][field] as typeof value) = value;
    setRequirements(updated);
  };

  const updateSpec = (index: number, specKey: string, value: string) => {
    const updated = [...requirements];
    updated[index].specs = {
      ...updated[index].specs,
      [specKey]: value,
    };
    setRequirements(updated);
  };

  const handleImageUpload = async (
    reqIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const updated = [...requirements];

    Array.from(files).forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`${file.name} supera los 2MB.`);
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert(`${file.name} no es una imagen válida.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        updated[reqIndex].images.push(base64);
        setRequirements([...updated]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (reqIndex: number, imageIndex: number) => {
    const updated = [...requirements];
    updated[reqIndex].images.splice(imageIndex, 1);
    setRequirements(updated);
  };

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

      // Validar que todos los requisitos tengan datos
      const invalidReq = requirements.find(
        (req) => !req.description || req.quantity <= 0
      );
      if (invalidReq) {
        throw new Error(
          "Todos los requisitos deben tener descripción y cantidad válida."
        );
      }

      // Crear evento
      const eventPayload = {
        userId: currentUser.id,
        name: eventName,
        date: eventDateValue.toISOString(),
        location: eventLocation,
      };

      const createdEvent = await eventsService.createEvent(eventPayload);

      // Crear cada requisito
      await Promise.all(
        requirements.map((req) =>
          eventsService.createRequirements(createdEvent.id, {
            description: `${productTypeLabels[req.productType]}: ${
              req.description
            }`,
            quantity: req.quantity,
            specs_json: {
              eventType: eventType,
              productType: req.productType,
              ...req.specs,
              images: req.images,
            },
          })
        )
      );

      router.push("/dashboard/orders?created=1");
    } catch (error) {
      console.error("Error al crear la orden:", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "Hubo un error al crear la orden. Intenta nuevamente."
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mr-3 text-sm">
                    2
                  </span>
                  Requisitos del evento
                </h2>
                <button
                  type="button"
                  onClick={addRequirement}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Agregar requisito
                </button>
              </div>

              <div className="space-y-6">
                {requirements.map((req, index) => (
                  <div
                    key={index}
                    className="border-2 border-gray-200 rounded-xl p-6 relative"
                  >
                    {requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                      >
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}

                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Requisito #{index + 1}
                    </h3>

                    {/* Tipo de producto */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tipo de producto <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={req.productType}
                        onChange={(e) =>
                          updateRequirement(
                            index,
                            "productType",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        required
                      >
                        <option value="camisetas">👕 Camisetas</option>
                        <option value="gorras">🧢 Gorras</option>
                        <option value="posters">🖼️ Pósters</option>
                        <option value="tazas">☕ Tazas</option>
                        <option value="otro">📦 Otro</option>
                      </select>
                    </div>

                    {/* Descripción */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Descripción <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={req.description}
                        onChange={(e) =>
                          updateRequirement(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Ej: Camisetas con logo del evento"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        required
                      />
                    </div>

                    {/* Cantidad */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cantidad <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={req.quantity || ""}
                        onChange={(e) =>
                          updateRequirement(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="Ej: 100"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        required
                      />
                    </div>

                    {/* Especificaciones */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Especificaciones (opcional)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={req.specs.color || ""}
                          onChange={(e) =>
                            updateSpec(index, "color", e.target.value)
                          }
                          placeholder="Color"
                          className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                        <input
                          type="text"
                          value={req.specs.size || ""}
                          onChange={(e) =>
                            updateSpec(index, "size", e.target.value)
                          }
                          placeholder="Talla / Tamaño"
                          className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                        <input
                          type="text"
                          value={req.specs.material || ""}
                          onChange={(e) =>
                            updateSpec(index, "material", e.target.value)
                          }
                          placeholder="Material"
                          className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                    </div>

                    {/* Imágenes */}
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Imágenes de referencia (opcional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(index, e)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                      {req.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 mt-3">
                          {req.images.map((img, imgIndex) => (
                            <div key={imgIndex} className="relative">
                              <img
                                src={img}
                                alt={`Preview ${imgIndex + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index, imgIndex)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
