"use client";

import { useState } from "react";

type Props = {
  onImageGenerated: (dataUrl: string) => void;
  label?: string;
  basePrompt?: string;
  endpoint?: string;
  className?: string;
};

export default function AIGenerateButton({
  onImageGenerated,
  label = "Generar con IA",
  basePrompt =
    "Show the object with two clear views presented side by side: Left: front view Right: back view. Both views must match in scale, lighting, and style, and appear cleanly aligned. clean vector illustration, high-quality, bold lines, no background, centered graphic, screen-print friendly.",
  endpoint = `${process.env.NEXT_PUBLIC_API_URL}/orders/ai-image`,
  className = "",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    const userPrompt = prompt.trim();
    if (!userPrompt) {
      alert("Por favor, ingresa un prompt para generar.");
      return;
    }
    const finalPrompt = `${basePrompt}. ${userPrompt}`;

    try {
      setIsLoading(true);
      const response = await fetch(endpoint, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "image/*,application/octet-stream",
        },
        body: JSON.stringify({ prompt: finalPrompt }),
      });
      if (!response.ok) {
        throw new Error(`Error del servicio IA: ${response.status}`);
      }
      const blob = await response.blob();

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        onImageGenerated(dataUrl);
        setIsOpen(false);
        setIsLoading(false);
        setPrompt("");
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Error generando imagen con IA:", err);
      alert(
        err instanceof Error
          ? err.message
          : "No se pudo generar la imagen. Intenta nuevamente."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
      >
        {label}
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-2 w-full max-w-xl bg-white border-2 border-gray-200 rounded-xl shadow-lg p-4">
          <div className="mb-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Prompt
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe la imagen a generar (ej: Camiseta azul con logo minimalista en el centro)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Generando..." : "Generar"}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-blue-500 hover:text-blue-500 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
