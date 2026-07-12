import { GoogleGenAI, Type } from "@google/genai";
import { listIngredients } from "./ingredients";
import type { AnalyzedIngredient, Urgency, VisionUrgency } from "./types";

// Gemini is used purely as a vision adapter: fridge photo -> ingredient names,
// quantities, and a rough urgency guess. Everything else (recipe matching) is a
// deliberate DB + algorithm design, not an LLM call.

const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";

const BASE_PROMPT = `
Identify all clearly visible edible ingredients in this fridge image.

Return only the ingredient name, estimated visible quantity, and estimated urgency.

Urgency must be exactly one of:

- "fresh": appears visually fresh with no obvious signs of deterioration
- "mid": appears usable but should probably be used soon, or the condition is uncertain
- "close_to_expired": shows visible signs of deterioration or has a clearly readable date that is approaching

Important rules:

- Only include food that is clearly visible.
- Do not guess hidden ingredients.
- Do not claim that food is safe or unsafe to eat.
- Quantity can be approximate, such as "3", "half bag", or "1 carton".
- Urgency is only a visual estimate and will be confirmed by the user.
- Do not include explanations or additional fields.
`.trim();

/**
 * Bias Gemini toward the app's canonical ingredient names without hard-constraining
 * it to them (an enum would drop real items the recipe DB just doesn't cover yet).
 * resolve_ingredients still does exact/alias/fuzzy matching downstream, so this is
 * purely a hint to reduce how often that fuzzy fallback has to fire.
 */
function buildPrompt(catalogueNames: string[]): string {
  if (catalogueNames.length === 0) return BASE_PROMPT;
  return `${BASE_PROMPT}

Known ingredient catalogue: ${catalogueNames.join(", ")}.
When an item matches one of these (even if described differently in the photo,
e.g. "roma tomato" -> "tomato"), use that exact catalogue name. If an item doesn't
match any of these, use its most natural common name instead.`;
}

// Structured-output schema so Gemini returns clean JSON (no markdown fences to strip).
const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quantity: { type: Type.STRING },
          urgency: {
            type: Type.STRING,
            enum: ["fresh", "mid", "close_to_expired"],
          },
        },
        required: ["name", "quantity", "urgency"],
      },
    },
  },
  required: ["ingredients"],
};

// Vision urgency -> the app's Urgency + a nominal "days left" (the model can't see
// real dates; this only feeds the "X days left" copy on /verify).
const URGENCY_MAP: Record<VisionUrgency, { urgency: Urgency; days: number }> = {
  close_to_expired: { urgency: "Urgent", days: 1 },
  mid: { urgency: "Soon", days: 3 },
  fresh: { urgency: "Fresh", days: 7 },
};

type RawIngredient = { name?: unknown; quantity?: unknown; urgency?: unknown };

/**
 * Send a base64-encoded fridge image to Gemini and return ingredients already
 * mapped to the frontend's shape. Throws on missing key or API/parse failure so
 * the caller can fall back to the demo fridge.
 */
export async function analyzeFridgeImage(
  base64: string,
  mimeType: string,
): Promise<AnalyzedIngredient[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  // Best-effort: a catalogue fetch failure shouldn't block vision entirely, it
  // just means the prompt falls back to no naming hints.
  const catalogueNames = await listIngredients()
    .then((rows) => rows.map((row) => row.name))
    .catch(() => []);
  const prompt = buildPrompt(catalogueNames);

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }, { inlineData: { mimeType, data: base64 } }],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: SCHEMA,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  const parsed = JSON.parse(text) as { ingredients?: RawIngredient[] };
  const raw = Array.isArray(parsed.ingredients) ? parsed.ingredients : [];

  return raw
    .filter((item): item is RawIngredient => typeof item?.name === "string")
    .map((item) => {
      const mapped = URGENCY_MAP[item.urgency as VisionUrgency] ?? URGENCY_MAP.mid;
      return {
        name: String(item.name).trim(),
        quantity: typeof item.quantity === "string" ? item.quantity : "",
        urgency: mapped.urgency,
        days: mapped.days,
      };
    })
    .filter((item) => item.name.length > 0);
}
