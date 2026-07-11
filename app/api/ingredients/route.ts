import { listIngredients } from "@/lib/ingredients";
import type { IngredientsResponse } from "@/lib/types";

// Same demo-insurance pattern as /api/recipes: if the database is unreachable,
// the "add ingredient" picker still works against a small static catalogue.
const FALLBACK: IngredientsResponse["ingredients"] = [
  { id: -1, name: "spinach" },
  { id: -2, name: "chicken" },
  { id: -3, name: "milk" },
  { id: -4, name: "egg" },
  { id: -5, name: "cheddar" },
  { id: -6, name: "tomato" },
  { id: -7, name: "bell pepper" },
  { id: -8, name: "broccoli" },
];

export async function GET(): Promise<Response> {
  try {
    const ingredients = await listIngredients();
    return Response.json({ ingredients } satisfies IngredientsResponse);
  } catch (error) {
    console.error("Listing ingredients failed, serving fallback:", error);
    return Response.json({ ingredients: FALLBACK } satisfies IngredientsResponse);
  }
}
