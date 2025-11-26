import type { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const prompt = searchParams.get("prompt");
    if (!prompt) {
      return new Response("Missing prompt", { status: 400 });
    }

    const apiKey = process.env.GENERATE_IMAGE_API_KEY;
    if (!apiKey) {
      console.error("Missing GENERATE_IMAGE_API_KEY env var");
      return new Response("Server misconfiguration", { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const candidates = response.candidates || [];
    for (const cand of candidates) {
      if (!cand.content?.parts) continue;
      for (const part of cand.content.parts) {
        if ((part as any).inlineData) {
          const inline = (part as any).inlineData as { data: string; mimeType?: string };
          const mime = inline.mimeType || "image/png";
          const b64 = inline.data;
          const bytes = Buffer.from(b64, "base64");
          return new Response(bytes, {
            status: 200,
            headers: {
              "Content-Type": mime,
              "Cache-Control": "no-store, max-age=0",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      }
    }

    // If no inline image found, try to return any text explanation for debugging
    const text = candidates
      .filter((c) => c.content)
      .flatMap((c) => c.content!.parts)
      .map((p: any) => p.text)
      .filter(Boolean)
      .join("\n");

    return new Response(text || "No image generated", { status: 502 });
  } catch (err) {
    console.error("/api/ai-image error:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return new Response(message, { status: 500 });
  }
}
