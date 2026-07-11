import { analyzeFridgeImage } from "@/lib/vision";
import type { AnalyzeResponse } from "@/lib/types";

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB — matches the upload UI copy.

export async function POST(request: Request): Promise<Response> {
  let file: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get("image");
    if (value instanceof File) file = value;
  } catch {
    return Response.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  if (!file) {
    return Response.json({ error: "No image provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "File is not an image" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "Image too large" }, { status: 400 });
  }

  try {
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const ingredients = await analyzeFridgeImage(base64, file.type);
    return Response.json({ ingredients } satisfies AnalyzeResponse);
  } catch (error) {
    // The client turns any failure into the demo-fridge fallback, so a live demo
    // never dead-ends on a flaky key or an unreadable photo.
    console.error("Fridge image analysis failed:", error);
    return Response.json({ ingredients: [] } satisfies AnalyzeResponse, { status: 502 });
  }
}
