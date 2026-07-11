import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const FRIDGE_PROMPT = `
Identify all clearly visible edible ingredients in this fridge image.

Return STRICT JSON only in this exact shape:

{
  "ingredients": [
    {
      "name": "string",
      "category": "string or null",
      "quantity_value": "number or null",
      "quantity_unit": "string or null",
      "urgency": "fresh | mid | close_to_expired"
    }
  ]
}

Rules:
- Only include ingredients clearly visible.
- Do not guess hidden ingredients.
- quantity_value must be numeric or null.
- quantity_unit examples: "L", "g", "pieces", "head", "pack", or null.
- If category is unknown, use null.
- urgency must be exactly one of: fresh, mid, close_to_expired.
`.trim();

export function parseGeminiJson(text: string) {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "");
  return JSON.parse(cleaned);
}