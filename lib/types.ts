// Shared types across the API route, the matching logic, and the frontend.

export type Urgency = "Urgent" | "Soon" | "Fresh";

/** An ingredient the user has on hand (from the fridge photo or manual entry). */
export type UserIngredient = {
  name: string;
  urgency: Urgency;
};

export type Filters = {
  count: number; // how many recipes to return
  diet: string[]; // e.g. ["Vegetarian", "Gluten-free", "High-protein"]
  exclude: string[]; // allergen attributes to exclude, e.g. ["nuts", "shellfish"]
  category: string | null; // meal type, e.g. "Dinner"
  cuisine: string | null; // e.g. "Italian" (hard filter)
  maxTime: number | null; // max cooking time in minutes
};

export type RecipesRequest = {
  ingredients: UserIngredient[];
  filters: Filters;
};

/** A scored recipe, shaped for the frontend. */
export type RecipeMatch = {
  id: number;
  name: string;
  image: string;
  time: number;
  score: number;
  cuisine: string | null;
  category: string | null;
  tags: string[];
  used: string[]; // ingredients the user has (display names)
  missing: string[]; // required ingredients the user lacks (shopping list)
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  steps: string[];
};

export type RecipesResponse = {
  relaxed: boolean; // true when filters were loosened to avoid an empty result
  recipes: RecipeMatch[];
};
