"use client";

import { useRouter } from "next/navigation";
import { useFridge } from "@/lib/fridge-context";
import RecipeCard from "../components/recipe-card";

export default function FavoritesPage() {
  const router = useRouter();
  const { recipes, saved } = useFridge();

  const savedRecipes = recipes.filter((recipe) => saved.includes(recipe.id));

  return (
    <section className="content">
      <p className="eyebrow">YOUR COLLECTION</p>
      <h2>Favourite recipes</h2>
      <p className="lead">
        {saved.length
          ? "Recipes you saved for another delicious day."
          : "Save recipes you love and they’ll live here."}
      </p>

      {savedRecipes.length ? (
        <div className="recipe-grid">
          {savedRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} compact />
          ))}
        </div>
      ) : (
        <div className="empty">
          ♡<h3>No favourites yet</h3>
          <p>Tap the heart on a recipe to save it here.</p>
          <button className="primary" onClick={() => router.push("/results")}>
            Explore recipes
          </button>
        </div>
      )}
    </section>
  );
}
