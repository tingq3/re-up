import { supabase } from "./supabase";
import type { Filters, RecipeIngredient, RecipeMatch, RecipesResponse, Urgency, UserIngredient } from "./types";

const URGENCY_WEIGHT: Record<Urgency, number> = { Urgent: 3, Soon: 2, Fresh: 1 };
const MAX_MISSING = 3; // a recipe must be roughly cookable to show, when partial matches are allowed
const RELAXED_MAX_MISSING = 6; // fallback tolerance when nothing matched, when partial matches are allowed
const COVERAGE_WEIGHT = 0.55; // "can I make it?"
const URGENCY_SCORE_WEIGHT = 0.45; // "does it use the expiring stuff?"

// Diet chips handled as hard SQL filters vs. soft score nudges.
const HARD_DIETS = new Set(["Vegetarian", "Vegan", "Gluten-free", "Dairy-free"]);

type CandidateRow = {
  id: number;
  name: string;
  image_url: string | null;
  time_minutes: number | null;
  servings: number | null;
  cuisine: string | null;
  category: string | null;
  tags: string[] | null;
  steps: string[] | null;
  ingredients: Array<{
    id: number; name: string; optional: boolean; quantity: string | null; quantity_grams: number | null;
    calories_per_100g: number | null; protein_per_100g: number | null; carbs_per_100g: number | null;
    fat_per_100g: number | null; price_per_100g: number | null;
  }>;
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

async function fetchCandidates(
  ingredientIds: number[],
  hardDiet: string[],
  filters: Filters,
  relaxed: boolean,
): Promise<CandidateRow[]> {
  const { data, error } = await supabase.rpc("candidate_recipes", {
    p_ingredient_ids: ingredientIds,
    p_diet: hardDiet,
    p_exclude: filters.exclude ?? [],
    // Relaxed pass keeps diet/allergen hard but drops cuisine/category/time.
    p_cuisine: relaxed ? null : filters.cuisine,
    p_category: relaxed ? null : filters.category,
    p_max_time: relaxed ? null : filters.maxTime,
  });
  if (error) throw new Error(`candidate_recipes failed: ${error.message}`);
  return (data ?? []) as CandidateRow[];
}

/** Rank candidates by ingredient coverage and the urgency of the items they consume. */
function scoreCandidates(
  rows: CandidateRow[],
  userById: Map<number, { weight: number; display: string; urgency: Urgency }>,
  totalUrgencyWeight: number,
  maxMissing: number,
  diet: string[],
): RecipeMatch[] {
  const wantsHighProtein = diet.includes("High-protein");
  const wantsLowCarb = diet.includes("Low-carb");

  const matches: RecipeMatch[] = [];

  for (const row of rows) {
    const required = row.ingredients.filter((ingredient) => !ingredient.optional);
    if (required.length === 0) continue;

    const used = required.filter((ingredient) => userById.has(ingredient.id));
    const missing = required.filter((ingredient) => !userById.has(ingredient.id));
    if (missing.length > maxMissing) continue;

    const coverage = used.length / required.length;
    const capturedWeight = used.reduce((sum, ingredient) => sum + userById.get(ingredient.id)!.weight, 0);
    const urgency = totalUrgencyWeight > 0 ? capturedWeight / totalUrgencyWeight : 0;

    let score = 100 * (COVERAGE_WEIGHT * coverage + URGENCY_SCORE_WEIGHT * urgency);
    const servings = Math.max(1, row.servings ?? 1);
    const total = row.ingredients.reduce(
      (sum, ingredient) => {
        const multiplier = (ingredient.quantity_grams ?? 0) / 100;
        return {
          calories: sum.calories + (ingredient.calories_per_100g ?? 0) * multiplier,
          protein: sum.protein + (ingredient.protein_per_100g ?? 0) * multiplier,
          carbs: sum.carbs + (ingredient.carbs_per_100g ?? 0) * multiplier,
          fat: sum.fat + (ingredient.fat_per_100g ?? 0) * multiplier,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
    const nutrition = Object.fromEntries(Object.entries(total).map(([key, value]) => [key, Math.round(value / servings)])) as typeof total;
    if (wantsHighProtein && nutrition.protein >= 25) score += 4;
    if (wantsLowCarb && nutrition.carbs <= 20) score += 4;

    const usedIngredients: RecipeIngredient[] = used.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      quantity: ingredient.quantity,
      quantityGrams: ingredient.quantity_grams ?? 0,
      optional: ingredient.optional,
    }));
    const estimatedSavings = used.reduce(
      (sum, ingredient) => {
        const value = ((ingredient.quantity_grams ?? 0) / 100) * (ingredient.price_per_100g ?? 0);
        return {
          avoidedPurchase: sum.avoidedPurchase + value,
          avoidedWaste: sum.avoidedWaste + (userById.get(ingredient.id)?.urgency === "Urgent" ? value : 0),
        };
      },
      { avoidedPurchase: 0, avoidedWaste: 0 },
    );

    matches.push({
      id: row.id,
      name: row.name,
      image: row.image_url ?? "",
      time: row.time_minutes ?? 0,
      score: Math.min(100, Math.round(score)),
      cuisine: row.cuisine,
      category: row.category,
      tags: row.tags ?? [],
      used: used.map((ingredient) => userById.get(ingredient.id)!.display),
      missing: missing.map((ingredient) => capitalize(ingredient.name)),
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      steps: row.steps ?? [],
      servings,
      ingredients: usedIngredients,
      estimatedSavings: {
        avoidedPurchase: Math.round(estimatedSavings.avoidedPurchase * 100) / 100,
        avoidedWaste: Math.round(estimatedSavings.avoidedWaste * 100) / 100,
      },
    });
  }

  return matches.sort((a, b) => b.score - a.score);
}

export async function matchRecipes(
  ingredients: UserIngredient[],
  filters: Filters,
): Promise<RecipesResponse> {
  // 1. Resolve free-text names -> canonical ingredient ids (exact/alias/fuzzy).
  const terms = ingredients.map((ingredient) => ingredient.name);
  const { data: resolved, error } = await supabase.rpc("resolve_ingredients", { terms });
  if (error) throw new Error(`resolve_ingredients failed: ${error.message}`);

  const idByTerm = new Map<string, number>();
  for (const row of (resolved ?? []) as { term: string; ingredient_id: number | null }[]) {
    if (row.ingredient_id != null) idByTerm.set(row.term, row.ingredient_id);
  }

  // Collapse to unique canonical ids, keeping the most urgent user entry per id.
  const userById = new Map<number, { weight: number; display: string; urgency: Urgency }>();
  for (const ingredient of ingredients) {
    const id = idByTerm.get(ingredient.name);
    if (id == null) continue;
    const weight = URGENCY_WEIGHT[ingredient.urgency];
    const existing = userById.get(id);
    if (!existing || weight > existing.weight) userById.set(id, { weight, display: ingredient.name, urgency: ingredient.urgency });
  }

  if (userById.size === 0) return { relaxed: false, recipes: [] };

  const ingredientIds = [...userById.keys()];
  const totalUrgencyWeight = [...userById.values()].reduce((sum, entry) => sum + entry.weight, 0);
  const hardDiet = (filters.diet ?? []).filter((diet) => HARD_DIETS.has(diet));
  const count = filters.count ?? 5;
  // "Only what I can make" (default) means zero missing ingredients, at either pass.
  const maxMissing = filters.allowPartial ? MAX_MISSING : 0;
  const relaxedMaxMissing = filters.allowPartial ? RELAXED_MAX_MISSING : 0;

  // 2. Strict pass: all filters honoured.
  const strict = scoreCandidates(
    await fetchCandidates(ingredientIds, hardDiet, filters, false),
    userById,
    totalUrgencyWeight,
    maxMissing,
    filters.diet ?? [],
  );
  if (strict.length > 0) return { relaxed: false, recipes: strict.slice(0, count) };

  // 3. Fallback: keep diet/allergen hard, drop cuisine/category/time, tolerate more missing
  // (only if partial matches are allowed — otherwise still require zero missing).
  const relaxedMatches = scoreCandidates(
    await fetchCandidates(ingredientIds, hardDiet, filters, true),
    userById,
    totalUrgencyWeight,
    relaxedMaxMissing,
    filters.diet ?? [],
  );
  return { relaxed: true, recipes: relaxedMatches.slice(0, count) };
}
