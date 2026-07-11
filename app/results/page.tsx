"use client";

import { useRouter } from "next/navigation";
import { useFridge } from "@/lib/fridge-context";
import Stepper from "../components/stepper";
import RecipeCard from "../components/recipe-card";

export default function ResultsPage() {
  const router = useRouter();
  const { recipes, loadingRecipes, relaxed } = useFridge();

  return (
    <section className="content">
      <Stepper active={3} />

      <p className="eyebrow">YOUR BEST MATCHES</p>
      <h2>Cook something brilliant.</h2>
      <p className="lead">
        Ranked to use what&apos;s already in your fridge — especially the ingredients that need you
        most.
      </p>

      {relaxed && recipes.length > 0 && (
        <div className="notice">
          ⚑ <span>No recipe matched every filter — here are your closest options.</span>
        </div>
      )}

      {loadingRecipes ? (
        <div className="empty">
          ✦<h3>Finding your best matches…</h3>
          <p>Ranking recipes by what needs using first.</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="empty">
          ◌<h3>No matches yet</h3>
          <p>Try removing a filter or adding a few more ingredients.</p>
          <button className="primary" onClick={() => router.push("/preferences")}>
            Edit preferences
          </button>
        </div>
      ) : (
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}

      <div className="footer-actions">
        <button className="text-button" onClick={() => router.push("/preferences")}>
          ← Edit preferences
        </button>
      </div>
    </section>
  );
}
