import { matchRecipes } from "@/lib/matching";
import type { RecipeMatch, RecipesRequest, RecipesResponse } from "@/lib/types";

// A tiny static catalogue used only if the database is unreachable, so a live
// demo never shows an empty screen because of a flaky network.
const FALLBACK: RecipeMatch[] = [
  {
    id: -1,
    name: "Chicken & Spinach Frittata",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80",
    time: 25,
    score: 96,
    cuisine: "Italian",
    category: "Dinner",
    tags: ["High protein", "Low carb"],
    used: ["Baby spinach", "Cooked chicken", "Eggs", "Cheddar"],
    missing: [],
    calories: 342,
    protein: 29,
    carbs: 6,
    fat: 22,
    servings: 4,
    ingredients: [],
    estimatedSavings: { avoidedPurchase: 0, avoidedWaste: 0 },
    steps: [
      "Heat a large oven-safe pan and soften the onion with garlic.",
      "Add chicken and spinach, cooking until the leaves have wilted.",
      "Whisk the eggs with seasoning and half the cheddar, then pour into the pan.",
      "Top with the remaining cheese and bake until golden and just set.",
    ],
  },
  {
    id: -2,
    name: "Garden Shakshuka",
    image: "https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=1000&q=80",
    time: 20,
    score: 88,
    cuisine: "Middle Eastern",
    category: "Breakfast",
    tags: ["Vegetarian", "One pan"],
    used: ["Baby spinach", "Eggs", "Tomatoes", "Bell pepper"],
    missing: ["Cumin", "Paprika"],
    calories: 218,
    protein: 14,
    carbs: 18,
    fat: 10,
    servings: 3,
    ingredients: [],
    estimatedSavings: { avoidedPurchase: 0, avoidedWaste: 0 },
    steps: [
      "Cook onion and bell pepper until soft.",
      "Simmer tomatoes with cumin and smoked paprika.",
      "Fold in spinach, then make wells in the sauce.",
      "Crack in the eggs, cover, and cook until the whites are set.",
    ],
  },
  {
    id: -3,
    name: "Broccoli Cheddar Soup",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1000&q=80",
    time: 30,
    score: 82,
    cuisine: "American",
    category: "Lunch",
    tags: ["Comfort food", "Vegetarian"],
    used: ["Broccoli", "Cheddar", "Milk"],
    missing: ["Vegetable stock"],
    calories: 285,
    protein: 16,
    carbs: 19,
    fat: 16,
    servings: 4,
    ingredients: [],
    estimatedSavings: { avoidedPurchase: 0, avoidedWaste: 0 },
    steps: [
      "Sauté onion and garlic in butter.",
      "Add chopped broccoli and stock, simmering until tender.",
      "Blend until silky, leaving some texture if desired.",
      "Stir through milk and cheese over low heat before serving.",
    ],
  },
];

export async function POST(request: Request): Promise<Response> {
  let body: RecipesRequest;
  try {
    body = (await request.json()) as RecipesRequest;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ingredients = Array.isArray(body?.ingredients) ? body.ingredients : [];
  if (ingredients.length === 0) {
    return Response.json({ error: "No ingredients provided" }, { status: 400 });
  }

  const filters = {
    count: body?.filters?.count ?? 5,
    diet: body?.filters?.diet ?? [],
    exclude: body?.filters?.exclude ?? [],
    category: body?.filters?.category ?? null,
    cuisine: body?.filters?.cuisine ?? null,
    maxTime: body?.filters?.maxTime ?? null,
    allowPartial: body?.filters?.allowPartial ?? false,
  };

  try {
    const result = await matchRecipes(ingredients, filters);
    return Response.json(result satisfies RecipesResponse);
  } catch (error) {
    console.error("Recipe matching failed, serving fallback:", error);
    const fallback = filters.allowPartial ? FALLBACK : FALLBACK.filter((recipe) => recipe.missing.length === 0);
    return Response.json({
      relaxed: false,
      recipes: fallback.slice(0, filters.count),
    } satisfies RecipesResponse);
  }
}
