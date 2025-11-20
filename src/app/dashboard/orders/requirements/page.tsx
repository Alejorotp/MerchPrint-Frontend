"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { authService, eventsService } from "@/lib/api";
import type { EventDTO, RequirementsDTO } from "@/lib/api";

type ProductType = "camisetas" | "gorras" | "posters" | "tazas" | "otro";

interface Requirement {
  productType: ProductType;
  description: string;
  quantity: number;
  specs: {
    color?: string;
    size?: string;
    material?: string;
    [key: string]: string | undefined;
  };
  images: string[]; // Base64 strings
}

const productTypeLabels: Record<ProductType, string> = {
  camisetas: "Camisetas",
  gorras: "Gorras",
  posters: "Pósters",
  tazas: "Tazas",
  otro: "Otro producto",
};

const productTypeEmojis: Record<ProductType, string> = {
  camisetas: "👕",
  gorras: "🧢",
  posters: "🖼️",
  tazas: "☕",
  otro: "📦",
};

export default function RequirementsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<EventDTO | null>(null);
  const [existingRequirements, setExistingRequirements] = useState<
    RequirementsDTO[]
  >([]);
  const [requirements, setRequirements] = useState<Requirement[]>([
    {
      productType: "camisetas",
      description: "",
      quantity: 0,
      specs: {},
      images: [],
    },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }

      if (!eventId) {
        setError("No se especificó un evento.");
        setIsLoading(false);
        return;
      }

      try {
        // Cargar evento
        const eventData = await eventsService.getEventById(eventId);
        setEvent(eventData);

        // Cargar requisitos existentes si los hay
        try {
          console.log("📥 Buscando requisitos para eventId:", eventId);
          const existingReqs = await eventsService.getRequirementsByEventId(
            eventId
          );
          console.log("📦 Requisitos recibidos del servidor:", existingReqs);
          if (Array.isArray(existingReqs) && existingReqs.length > 0) {
            setExistingRequirements(existingReqs);
            console.log(
              "✅ Requisitos existentes cargados:",
              existingReqs.length
            );
          } else {
            console.log("ℹ️ No hay requisitos existentes para este evento");
          }
        } catch (err) {
          console.error("⚠️ Error al cargar requisitos existentes:", err);
          // No hay requisitos existentes, está bien
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("No se pudo cargar el evento.");
        setIsLoading(false);
      }
    };

    loadData();
  }, [eventId, router]);

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
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const updateRequirement = (
    index: number,
    field: keyof Requirement,
    value: any
  ) => {
    const updated = [...requirements];
    updated[index] = { ...updated[index], [field]: value };
    setRequirements(updated);
  };

  const updateSpec = (reqIndex: number, specKey: string, specValue: string) => {
    const updated = [...requirements];
    updated[reqIndex].specs[specKey] = specValue;
    setRequirements(updated);
  };

  const handleImageUpload = (
    reqIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files) return;

    const updated = [...requirements];

    Array.from(files).forEach((file) => {
      // Validar tamaño (máximo 2MB por imagen)
      if (file.size > 2 * 1024 * 1024) {
        alert(`La imagen ${file.name} es muy grande. Máximo 2MB por imagen.`);
        return;
      }

      // Validar tipo
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
    setError(null);
    setIsSaving(true);

    try {
      if (!eventId) {
        throw new Error("No se especificó un evento.");
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

      // Crear cada requisito en el backend
      console.log("📤 Enviando requisitos para eventId:", eventId);
      console.log("📋 Requisitos a enviar:", requirements);

      const responses = await Promise.all(
        requirements.map(async (req) => {
          const payload = {
            description: `${productTypeLabels[req.productType]}: ${
              req.description
            }`,
            quantity: req.quantity,
            specs_json: {
              productType: req.productType,
              ...req.specs,
              images: req.images,
            },
          };
          console.log("🚀 Enviando requisito:", payload);
          const result = await eventsService.createRequirements(
            eventId,
            payload
          );
          console.log("✅ Respuesta del servidor:", result);
          return result;
        })
      );

      console.log("✅ Todos los requisitos creados:", responses);

      // Redirigir de vuelta a la página de órdenes
      router.push("/dashboard/orders");
    } catch (err) {
      console.error("Error guardando requisitos:", err);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron guardar los requisitos. Intenta nuevamente."
      );
      setIsSaving(false);
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

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
              {error}
            </div>
          </div>
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
            <button
              type="button"
              onClick={() => router.back()}
              className="text-blue-500 hover:text-blue-600 font-medium mb-4 flex items-center gap-2"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Volver
            </button>

            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Agregar requisitos
            </h1>
            <p className="text-gray-600">
              Define qué productos necesitas para:{" "}
              <span className="font-semibold">{event?.name}</span>
            </p>
            {event && (
              <p className="text-sm text-gray-500 mt-1">
                📍 {event.location} · 📅{" "}
                {new Date(event.date).toLocaleDateString("es-ES")}
              </p>
            )}
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Requisitos existentes */}
          {existingRequirements.length > 0 && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Requisitos ya creados ({existingRequirements.length})
              </h3>
              <div className="space-y-2">
                {existingRequirements.map((req, idx) => (
                  <div key={idx} className="text-sm text-blue-800">
                    • {req.description} - {req.quantity} unidades
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {requirements.map((req, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm p-6 border-2 border-gray-100"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Producto #{index + 1}
                  </h3>
                  {requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-red-500 hover:text-red-600 font-medium"
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Tipo de producto */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo de producto
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {(Object.keys(productTypeLabels) as ProductType[]).map(
                        (type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() =>
                              updateRequirement(index, "productType", type)
                            }
                            className={`p-3 rounded-xl border-2 transition-all text-center ${
                              req.productType === type
                                ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                                : "border-gray-200 hover:border-blue-300 text-gray-700"
                            }`}
                          >
                            <div className="text-2xl mb-1">
                              {productTypeEmojis[type]}
                            </div>
                            <div className="text-xs">
                              {productTypeLabels[type]}
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descripción del producto
                    </label>
                    <input
                      type="text"
                      value={req.description}
                      onChange={(e) =>
                        updateRequirement(index, "description", e.target.value)
                      }
                      placeholder="Ej: Camisetas con logo del evento"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
                    />
                  </div>

                  {/* Cantidad */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cantidad requerida
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

                  {/* Especificaciones adicionales */}
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

                  {/* Imágenes de referencia */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Imágenes de referencia (opcional)
                    </label>

                    {/* Preview de imágenes cargadas */}
                    {req.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        {req.images.map((image, imgIndex) => (
                          <div key={imgIndex} className="relative group">
                            <img
                              src={image}
                              alt={`Referencia ${imgIndex + 1}`}
                              className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index, imgIndex)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Botón para cargar imágenes */}
                    <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm text-gray-600 font-medium">
                        Subir imágenes (máx. 2MB c/u)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(index, e)}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Puedes subir varias imágenes de referencia para el diseño
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Botón agregar más */}
            <button
              type="button"
              onClick={addRequirement}
              className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-blue-500 hover:text-blue-500 transition-all font-medium"
            >
              + Agregar otro producto
            </button>

            {/* Botones de acción */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-500 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Guardando..." : "Guardar requisitos"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
