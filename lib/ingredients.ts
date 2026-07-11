import { supabase } from "./supabase";
import type { CanonicalIngredient } from "./types";

/** The full canonical ingredient catalogue, for the manual "add ingredient" picker. */
export async function listIngredients(): Promise<CanonicalIngredient[]> {
  const { data, error } = await supabase
    .from("ingredients")
    .select("id, name")
    .order("name", { ascending: true });
  if (error) throw new Error(`listIngredients failed: ${error.message}`);
  return (data ?? []) as CanonicalIngredient[];
}
