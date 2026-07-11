import fs from "node:fs";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

const geminiApiKey = process.env.GEMINI_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasepublicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!geminiApiKey) {
  console.error("Missing GEMINI_API_KEY in .env.local");
  process.exit(1);
}

if (!supabaseUrl || !supabasepublicKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const imagePath = process.argv[2] ?? "test-fridge.jpg";

if (!fs.existsSync(imagePath)) {
  console.error(`Image not found: ${imagePath}`);
  process.exit(1);
}

const extension = path.extname(imagePath).toLowerCase();

const mimeTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const mimeType = mimeTypes[extension];

if (!mimeType) {
  console.error("Use a JPG, JPEG, PNG, or WEBP image.");
  process.exit(1);
}

const imageData = fs.readFileSync(imagePath, { encoding: "base64" });

const ai = new GoogleGenAI({ apiKey: geminiApiKey });
const supabase = createClient(supabaseUrl, supabasepublicKey);

function parseJsonFromModel(text) {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "");
  return JSON.parse(cleaned);
}

function urgencyToDefaults(urgency) {
  if (urgency === "close_to_expired") {
    return { average_expiry_days: 2, caution: "Use soon (AI visual estimate)" };
  }
  if (urgency === "mid") {
    return {
      average_expiry_days: 5,
      caution: "Use within a few days (AI visual estimate)",
    };
  }
  return { average_expiry_days: 10, caution: "Looks fresh (AI visual estimate)" };
}

function addDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

try {
  const interaction = await ai.interactions.create({
    model: "gemini-3.5-flash",
    input: [
      {
        type: "text",
        text: `
Identify all clearly visible edible ingredients in this fridge image.

Return STRICT JSON only (no markdown, no explanation) in this exact shape:

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
- quantity_value must be numeric (example: 1, 0.5, 6) or null.
- quantity_unit examples: "L", "g", "pieces", "head", "pack", or null.
- If category is unknown, use null.
- urgency must be exactly one of: fresh, mid, close_to_expired.
        `.trim(),
      },
      {
        type: "image",
        data: imageData,
        mime_type: mimeType,
      },
    ],
  });

  const rawText = interaction.output_text ?? "";
  const parsed = parseJsonFromModel(rawText);

  if (!Array.isArray(parsed.ingredients)) {
    throw new Error("Gemini returned invalid payload: ingredients is not an array");
  }

  const rows = parsed.ingredients
    .filter((item) => item?.name)
    .map((item) => {
      const urgency = item.urgency;
      const defaults = urgencyToDefaults(urgency);

      return {
        name: String(item.name).trim(),
        category: item.category ?? null,
        quantity:
          typeof item.quantity_value === "number" ? item.quantity_value : null,
        unit: item.quantity_unit ?? null,
        average_expiry_days: defaults.average_expiry_days,
        expiry_date: addDaysISO(defaults.average_expiry_days),
        caution: defaults.caution,
      };
    });

  if (rows.length === 0) {
    console.log("No ingredients detected.");
    process.exit(0);
  }

  const { data, error } = await supabase.from("ingredients").insert(rows).select();

  if (error) {
    throw error;
  }

  console.log("\nInserted ingredients:\n");
  console.table(
    data.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      quantity: row.quantity,
      unit: row.unit,
      expiry_date: row.expiry_date,
    }))
  );
} catch (error) {
  console.error("\nFridge scan + insert failed:");
  console.error(error);
  process.exit(1);
}