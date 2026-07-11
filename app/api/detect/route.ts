import { NextResponse } from "next/server";
import { ai, FRIDGE_PROMPT, parseGeminiJson } from "@/lib/gemini";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type DetectedIngredient = {
  name: string;
  category?: string | null;
  quantity_value?: number | null;
  quantity_unit?: string | null;
  urgency?: "fresh" | "mid" | "close_to_expired";
};

function urgencyToDefaults(urgency?: string) {
  if (urgency === "close_to_expired") {
    return { average_expiry_days: 2, caution: "Use soon (AI visual estimate)" };
  }

  if (urgency === "mid") {
    return { average_expiry_days: 5, caution: "Use within a few days (AI visual estimate)" };
  }

  return { average_expiry_days: 10, caution: "Looks fresh (AI visual estimate)" };
}

function addDaysISO(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType } = body ?? {};

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: "imageBase64 and mimeType are required" },
        { status: 400 }
      );
    }

    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash",
      input: [
        { type: "text", text: FRIDGE_PROMPT },
        { type: "image", data: imageBase64, mime_type: mimeType },
      ],
    });

    const parsed = parseGeminiJson(interaction.output_text ?? "");

    if (!Array.isArray(parsed.ingredients)) {
      return NextResponse.json(
        { error: "Invalid Gemini response" },
        { status: 500 }
      );
    }

    const rows = (parsed.ingredients as DetectedIngredient[])
      .filter((item) => item?.name)
      .map((item) => {
        const defaults = urgencyToDefaults(item.urgency);

        return {
          name: String(item.name).trim(),
          category: item.category ?? null,
          quantity:
            typeof item.quantity_value === "number"
              ? item.quantity_value
              : null,
          unit: item.quantity_unit ?? null,
          average_expiry_days: defaults.average_expiry_days,
          expiry_date: addDaysISO(defaults.average_expiry_days),
          caution: defaults.caution,
        };
      });

    if (rows.length === 0) {
      return NextResponse.json({ inserted: [], count: 0 });
    }

    const { data, error } = await supabase
      .from("ingredients")
      .insert(rows)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      inserted: data,
      count: data?.length ?? 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}