"use client";

// Client-side store shared across every route in the flow.
// Mounted once in the root layout, so navigating between /verify, /preferences,
// /results, etc. preserves the fridge without any persistence (matches the
// "fridge held in state, not persisted" design in CLAUDE.md).

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { AnalyzedIngredient, RecipeMatch, Urgency } from "@/lib/types";

export type Ingredient = {
  id: number;
  name: string;
  quantity: string;
  days: number;
  urgency: Urgency;
  available: boolean;
};

export const URGENCIES: Urgency[] = ["Urgent", "Soon", "Fresh"];

export const CUISINES = [
  "Any",
  "Italian",
  "Middle Eastern",
  "American",
  "Indian",
  "Asian",
  "French",
  "Mexican",
  "Mediterranean",
  "Seafood",
];

export const DIETARY = [
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Dairy-free",
  "High-protein",
  "Low-carb",
];

export const MEAL_TYPES = ["Any", "Breakfast", "Lunch", "Dinner", "Snacks"];

// How many scored matches to fetch per request. The results page shows a handful
// up front and reveals more from this pool via "Show more" — no user-facing control.
const RECIPE_FETCH_COUNT = 20;

export const COOK_TIME_OPTIONS = [
  "Any",
  "Under 15 min",
  "Under 30 min",
  "Under 1 hour",
];

const COOK_TIME_MINUTES: Record<string, number> = {
  "Under 15 min": 15,
  "Under 30 min": 30,
  "Under 1 hour": 60,
};

const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: 1, name: "Baby spinach", quantity: "1 bag", days: 1, urgency: "Urgent", available: true },
  { id: 2, name: "Cooked chicken", quantity: "250 g", days: 1, urgency: "Urgent", available: true },
  { id: 3, name: "Milk", quantity: "400 ml", days: 3, urgency: "Soon", available: true },
  { id: 4, name: "Eggs", quantity: "6 large", days: 14, urgency: "Fresh", available: true },
  { id: 5, name: "Cheddar", quantity: "150 g", days: 21, urgency: "Fresh", available: true },
  { id: 6, name: "Tomatoes", quantity: "3 medium", days: 4, urgency: "Soon", available: true },
  { id: 7, name: "Bell pepper", quantity: "2", days: 7, urgency: "Fresh", available: true },
  { id: 8, name: "Broccoli", quantity: "1 head", days: 5, urgency: "Soon", available: true },
];

type FridgeContextValue = {
  // Ingredients
  ingredients: Ingredient[];
  urgentCount: number;
  addIngredient: (name: string) => void;
  removeIngredient: (id: number) => void;
  toggleAvailable: (id: number) => void;
  setQuantity: (id: number, quantity: string) => void;
  setUrgency: (id: number, urgency: Urgency) => void;

  // Fridge-photo analysis
  analyzing: boolean;
  analysisNote: string | null;
  analyzeImage: (file: File) => Promise<void>;
  loadDemoFridge: () => void;
  startBlankFridge: () => void;

  // Preferences / filters
  dietary: string[];
  toggleDiet: (item: string) => void;
  mealType: string;
  setMealType: (value: string) => void;
  cookTime: string;
  setCookTime: (value: string) => void;
  cuisine: string;
  setCuisine: (value: string) => void;
  allowPartial: boolean;
  setAllowPartial: (value: boolean) => void;

  // Recipe results
  recipes: RecipeMatch[];
  loadingRecipes: boolean;
  relaxed: boolean;
  findRecipes: () => Promise<void>;

  // Favourites
  saved: number[];
  toggleSaved: (id: number) => void;
  cooked: number[];
  markCooked: (id: number) => void;
};

const FridgeContext = createContext<FridgeContextValue | null>(null);

export function FridgeProvider({ children }: { children: ReactNode }) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [dietary, setDietary] = useState<string[]>([]);
  const [mealType, setMealType] = useState("Any");
  const [cookTime, setCookTime] = useState("Any");
  const [cuisine, setCuisine] = useState("Any");
  const [allowPartial, setAllowPartial] = useState(false);
  const [recipes, setRecipes] = useState<RecipeMatch[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [relaxed, setRelaxed] = useState(false);
  const [saved, setSaved] = useState<number[]>([]);
  const [cooked, setCooked] = useState<number[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisNote, setAnalysisNote] = useState<string | null>(null);

  const updateIngredient = (id: number, patch: Partial<Ingredient>) =>
    setIngredients((all) => all.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  // Add a canonical ingredient picked from the /verify catalogue. If it's already
  // in the fridge, just make sure it's marked available instead of adding a duplicate
  // row (duplicate rows would resolve to the same DB ingredient id anyway).
  const addIngredient = (name: string) =>
    setIngredients((all) => {
      const existing = all.find((item) => item.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        return existing.available
          ? all
          : all.map((item) => (item.id === existing.id ? { ...item, available: true } : item));
      }
      return [
        { id: Date.now(), name, quantity: "1 item", days: 7, urgency: "Fresh", available: true },
        ...all,
      ];
    });

  const removeIngredient = (id: number) =>
    setIngredients((all) => all.filter((item) => item.id !== id));

  const toggleAvailable = (id: number) => {
    const current = ingredients.find((item) => item.id === id);
    if (current) updateIngredient(id, { available: !current.available });
  };

  const setQuantity = (id: number, quantity: string) => updateIngredient(id, { quantity });
  const setUrgency = (id: number, urgency: Urgency) => updateIngredient(id, { urgency });

  // Load the built-in sample fridge (the "demo fridge" path and the analysis fallback).
  const loadDemoFridge = () => {
    setIngredients(INITIAL_INGREDIENTS);
    setAnalysisNote(null);
  };

  // Start from an empty fridge for fully manual entry (no photo, no demo data).
  const startBlankFridge = () => {
    setIngredients([]);
    setAnalysisNote(null);
  };

  // Send a fridge photo to Gemini (via /api/analyze) and replace the fridge with what
  // it detected. On any failure, fall back to the sample fridge with a note so the flow
  // never dead-ends.
  const analyzeImage = async (file: File) => {
    setAnalyzing(true);
    setAnalysisNote(null);
    try {
      const form = new FormData();
      form.append("image", file);
      const response = await fetch("/api/analyze", { method: "POST", body: form });
      if (!response.ok) throw new Error(`analyze failed: ${response.status}`);
      const data = (await response.json()) as { ingredients?: AnalyzedIngredient[] };
      const detected = data.ingredients ?? [];
      if (detected.length === 0) throw new Error("no ingredients detected");
      setIngredients(
        detected.map((item, index) => ({ id: Date.now() + index, available: true, ...item })),
      );
    } catch {
      setIngredients(INITIAL_INGREDIENTS);
      setAnalysisNote("We couldn't read that photo — here's a sample fridge to edit.");
    } finally {
      setAnalyzing(false);
    }
  };

  const urgentCount = ingredients.filter(
    (item) => item.available && item.urgency === "Urgent",
  ).length;

  const toggleDiet = (item: string) =>
    setDietary((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
    );

  const toggleSaved = (id: number) =>
    setSaved((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );

  const markCooked = (id: number) =>
    setCooked((current) => (current.includes(id) ? current : [...current, id]));

  const findRecipes = async () => {
    setLoadingRecipes(true);
    setRelaxed(false);
    try {
      const payload = {
        ingredients: ingredients
          .filter((item) => item.available)
          .map((item) => ({ name: item.name, quantity: item.quantity, urgency: item.urgency })),
        filters: {
          count: RECIPE_FETCH_COUNT,
          diet: dietary,
          exclude: [] as string[],
          category: mealType === "Any" || mealType === "Snacks" ? null : mealType,
          cuisine: cuisine === "Any" ? null : cuisine,
          maxTime: COOK_TIME_MINUTES[cookTime] ?? null,
          allowPartial,
        },
      };
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setRecipes(data.recipes ?? []);
      setRelaxed(Boolean(data.relaxed));
    } catch {
      setRecipes([]);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const value: FridgeContextValue = {
    ingredients,
    urgentCount,
    addIngredient,
    removeIngredient,
    toggleAvailable,
    setQuantity,
    setUrgency,
    analyzing,
    analysisNote,
    analyzeImage,
    loadDemoFridge,
    startBlankFridge,
    dietary,
    toggleDiet,
    mealType,
    setMealType,
    cookTime,
    setCookTime,
    cuisine,
    setCuisine,
    allowPartial,
    setAllowPartial,
    recipes,
    loadingRecipes,
    relaxed,
    findRecipes,
    saved,
    toggleSaved,
    cooked,
    markCooked,
  };

  return <FridgeContext.Provider value={value}>{children}</FridgeContext.Provider>;
}

export function useFridge() {
  const context = useContext(FridgeContext);
  if (!context) {
    throw new Error("useFridge must be used within a FridgeProvider");
  }
  return context;
}
