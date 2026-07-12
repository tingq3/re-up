-- Ingredient nutrition and prices are the source of truth. Values are per 100 g;
-- recipe_ingredients.quantity_grams is the normalized amount used by a recipe.
alter table public.ingredients
  add column if not exists calories_per_100g numeric(8,2) not null default 0,
  add column if not exists protein_per_100g numeric(8,2) not null default 0,
  add column if not exists carbs_per_100g numeric(8,2) not null default 0,
  add column if not exists fat_per_100g numeric(8,2) not null default 0,
  add column if not exists price_per_100g numeric(8,2) not null default 0;

alter table public.recipe_ingredients
  add column if not exists quantity_grams numeric(10,2);

-- candidate_recipes retains the app's existing shape, while returning enough
-- ingredient detail for the app to calculate nutrition and estimated savings.
create or replace function public.candidate_recipes(
  p_ingredient_ids integer[], p_diet text[], p_exclude text[],
  p_cuisine text, p_category text, p_max_time integer
)
returns table (
  id integer, name text, image_url text, time_minutes integer, servings integer,
  cuisine text, category text, tags text[], steps text[], ingredients jsonb
)
language sql stable
as $$
  select r.id, r.name, r.image_url, r.time_minutes, r.servings,
    r.cuisine, r.category, r.tags, r.steps,
    coalesce(jsonb_agg(jsonb_build_object(
      'id', i.id, 'name', i.name, 'optional', ri.optional,
      'quantity', ri.quantity, 'quantity_grams', ri.quantity_grams,
      'calories_per_100g', i.calories_per_100g,
      'protein_per_100g', i.protein_per_100g,
      'carbs_per_100g', i.carbs_per_100g, 'fat_per_100g', i.fat_per_100g,
      'price_per_100g', i.price_per_100g
    ) order by ri.ingredient_id), '[]'::jsonb)
  from public.recipes r
  join public.recipe_ingredients ri on ri.recipe_id = r.id
  join public.ingredients i on i.id = ri.ingredient_id
  where exists (
    select 1 from public.recipe_ingredients matching
    where matching.recipe_id = r.id and matching.ingredient_id = any(p_ingredient_ids)
  )
    and (cardinality(p_diet) = 0
      or ('Vegetarian' <> all(p_diet) or r.is_vegetarian)
      and ('Vegan' <> all(p_diet) or r.is_vegan)
      and ('Gluten-free' <> all(p_diet) or r.is_gluten_free)
      and ('Dairy-free' <> all(p_diet) or not exists (
        select 1 from public.recipe_ingredients dri
        join public.ingredients di on di.id = dri.ingredient_id
        where dri.recipe_id = r.id and 'dairy' = any(di.attributes)
      )))
    and (p_cuisine is null or r.cuisine = p_cuisine)
    and (p_category is null or r.category = p_category)
    and (p_max_time is null or r.time_minutes <= p_max_time)
    and not exists (
      select 1 from public.recipe_ingredients eri
      join public.ingredients ei on ei.id = eri.ingredient_id
      where eri.recipe_id = r.id and ei.attributes && p_exclude
    )
  group by r.id;
$$;
