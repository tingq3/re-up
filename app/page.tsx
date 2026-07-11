import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: ingredients } = await supabase
    .from("ingredients")
    .select(
      "id, name, category, quantity, unit, average_expiry_days, expiry_date, caution"
    )
    .order("expiry_date", { ascending: true });

  const { data: recipes } = await supabase
    .from("recipes")
    .select(
      "id, title, description, ingredients, prep_minutes, cook_minutes, servings, calories"
    );

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold mb-8">
        🥦 Fridge Recipe AI
      </h1>

      {/* Ingredients */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">
          Ingredients (Ordered by Expiry)
        </h2>

        <div className="grid grid-cols-3 gap-4">
          {ingredients?.map((item) => (
            <div
              key={item.id}
              className="rounded-lg bg-white p-4 shadow"
            >
              <h3 className="text-lg font-bold">{item.name}</h3>

              <p>Category: {item.category}</p>

              <p>
                Quantity: {item.quantity} {item.unit}
              </p>

              <p>Average Expiry: {item.average_expiry_days} days</p>

              <p className="text-red-600 font-semibold">
                Expires: {item.expiry_date}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                {item.caution}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Recipes */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Available Recipes
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {recipes?.map((recipe) => (
            <div
              key={recipe.id}
              className="rounded-lg bg-white p-4 shadow"
            >
              <h3 className="text-xl font-bold">{recipe.title}</h3>

              <p className="text-gray-600 mb-2">
                {recipe.description}
              </p>

              <p>
                <strong>Ingredients:</strong>{" "}
                {recipe.ingredients.join(", ")}
              </p>

              <p className="mt-2">
                ⏱ {recipe.prep_minutes} min | 🍳 {recipe.cook_minutes} min
              </p>

              <p>
                👥 {recipe.servings} servings
              </p>

              <p>
                🔥 {recipe.calories} kcal
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}