"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useFridge } from "@/lib/fridge-context";
import RecipeCard from "../components/recipe-card";

export default function FavoritesPage() {
  const router = useRouter();
  const { recipes, saved } = useFridge();

  const savedRecipes = recipes.filter((recipe) => saved.includes(recipe.id));

  return (
    <section className="mx-auto w-[min(1050px,calc(100%-48px))] pt-12 pb-20 max-[700px]:w-[min(100%-32px,1050px)]">
      <p className="mb-3 text-[11px] font-bold tracking-[0.13em] text-leaf">YOUR COLLECTION</p>
      <h2 className="text-[40px] font-bold tracking-[-0.04em]">Favourite recipes</h2>
      <p className="mt-3 mb-6 leading-[1.55] text-muted">
        {saved.length
          ? "Recipes you saved for another delicious day."
          : "Save recipes you love and they’ll live here."}
      </p>

      {savedRecipes.length ? (
        <div className="grid grid-cols-3 gap-5 max-[700px]:grid-cols-1">
          {savedRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} compact />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-[14px] bg-ash-100 px-5 py-16 text-center text-leaf">
          <Heart size={28} />
          <h3 className="mt-4 mb-2 text-2xl font-bold text-ink">No favourites yet</h3>
          <p className="mb-5 text-sm text-muted">Tap the heart on a recipe to save it here.</p>
          <button
            className="inline-flex items-center gap-2 rounded-[10px] border border-transparent bg-leaf px-5 py-3 text-sm font-bold text-white shadow-[0_4px_10px_#27725c23] hover:bg-[#1d614d]"
            onClick={() => router.push("/results")}
          >
            Explore recipes
          </button>
        </div>
      )}
    </section>
  );
}
