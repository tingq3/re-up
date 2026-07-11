import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: ingredients } = await supabase
    .from("ingredients")
    .select("id, name, category, average_expiry_days");

  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, title, difficulty, prep_minutes, cook_minutes");

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold mb-8">
        🥦 Fridge Recipe AI Database Test
      </h1>

      {/* Ingredients */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>

        <div className="grid grid-cols-3 gap-4">
          {ingredients?.map((ingredient: {
            id: string;
            name: string;
            category: string;
            average_expiry_days: number;
          }) => (
            <div
              key={ingredient.id}
              className="rounded-lg bg-white p-4 shadow"
            >
              <h3 className="font-bold">{ingredient.name}</h3>
              <p>{ingredient.category}</p>
              <p>{ingredient.average_expiry_days} days</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recipes */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recipes</h2>

        <div className="grid grid-cols-2 gap-4">
          {recipes?.map((recipe: {
            id: string;
            title: string;
            difficulty: string;
            prep_minutes: number;
            cook_minutes: number;
          }) => (
            <div
              key={recipe.id}
              className="rounded-lg bg-white p-4 shadow"
            >
              <h3 className="font-bold">{recipe.title}</h3>

              <p>Difficulty: {recipe.difficulty}</p>

              <p>
                ⏱ {recipe.prep_minutes} min | 🍳 {recipe.cook_minutes} min
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}