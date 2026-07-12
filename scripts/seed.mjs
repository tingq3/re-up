// Reproducible seed for the recipe-matching tables.
//
// Reads data/recipes.json and loads ingredients, recipes and recipe_ingredients,
// deriving each recipe's diet flags from its ingredients' attributes.
//
// RLS on these tables only allows public SELECT, so writing needs the service-role
// key. Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase dashboard -> Project
// Settings -> API), then run:
//
//   node --env-file=.env.local scripts/seed.mjs
//
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  console.error("Run with: node --env-file=.env.local scripts/seed.mjs");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const root = path.resolve(fileURLToPath(import.meta.url), "../..");
const data = JSON.parse(fs.readFileSync(path.join(root, "data/recipes.json"), "utf8"));
const nutrition = JSON.parse(fs.readFileSync(path.join(root, "data/ingredient-nutrition.json"), "utf8"));

// Diet flags are a function of ingredient attributes — same rules as the SQL seed.
const MEAT = ["meat", "fish", "shellfish"];
const NON_VEGAN = [...MEAT, "dairy", "egg", "honey"];
const deriveFlags = (attrs) => ({
  is_vegetarian: !MEAT.some((a) => attrs.includes(a)),
  is_vegan: !NON_VEGAN.some((a) => attrs.includes(a)),
  is_gluten_free: !attrs.includes("gluten"),
});

// Converts recipe-friendly measures to a consistent gram value. These are estimates,
// intentionally shown as such in the UI; explicit g/ml measures take precedence.
const gramsFor = (quantity, name) => {
  const amount = Number.parseFloat(quantity ?? "") || 1;
  const unit = (quantity ?? "").toLowerCase();
  if (/\bkg\b/.test(unit)) return amount * 1000;
  if (/\b(g|gram|grams)\b/.test(unit)) return amount;
  if (/\bml\b/.test(unit)) return amount;
  if (/litre|liter/.test(unit)) return amount * 1000;
  if (/tbsp|tablespoon/.test(unit)) return amount * 15;
  if (/tsp|teaspoon/.test(unit)) return amount * 5;
  if (/clove/.test(unit)) return amount * 3;
  if (/handful/.test(unit)) return amount * 30;
  return amount * (nutrition[name]?.portion ?? 100);
};

async function run() {
  // Idempotent: clear existing rows (children first).
  await supabase.from("recipe_ingredients").delete().gte("recipe_id", 0);
  await supabase.from("recipes").delete().gte("id", 0);
  await supabase.from("ingredients").delete().gte("id", 0);

  const { data: ingRows, error: ingErr } = await supabase
    .from("ingredients")
    .insert(data.ingredients.map(({ name, aliases, attributes }) => {
      const values = nutrition[name];
      if (!values) throw new Error(`Missing nutrition for ${name}`);
      return { name, aliases, attributes, calories_per_100g: values.calories, protein_per_100g: values.protein, carbs_per_100g: values.carbs, fat_per_100g: values.fat, price_per_100g: values.price };
    }))
    .select("id, name, attributes");
  if (ingErr) throw ingErr;

  const idByName = new Map(ingRows.map((r) => [r.name, r.id]));
  const attrsByName = new Map(ingRows.map((r) => [r.name, r.attributes]));

  for (const recipe of data.recipes) {
    const attrs = recipe.ingredients.flatMap((ri) => attrsByName.get(ri.name) ?? []);
    const { ingredients, ...fields } = recipe;

    const { data: recRows, error: recErr } = await supabase
      .from("recipes")
      .insert({ ...fields, ...deriveFlags(attrs) })
      .select("id")
      .single();
    if (recErr) throw recErr;

    const links = ingredients
      .filter((ri) => idByName.has(ri.name))
      .map((ri) => ({
        recipe_id: recRows.id,
        ingredient_id: idByName.get(ri.name),
        quantity: ri.quantity ?? null,
        quantity_grams: gramsFor(ri.quantity, ri.name),
        optional: ri.optional ?? false,
      }));
    const { error: linkErr } = await supabase.from("recipe_ingredients").insert(links);
    if (linkErr) throw linkErr;

    const missing = ingredients.filter((ri) => !idByName.has(ri.name));
    if (missing.length) {
      console.warn(`  ! ${recipe.name}: uncatalogued ingredients`, missing.map((m) => m.name));
    }
  }

  console.log(`Seeded ${data.ingredients.length} ingredients and ${data.recipes.length} recipes.`);
}

run().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
