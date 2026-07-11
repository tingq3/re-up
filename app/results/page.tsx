"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CircleDashed, Flag, Sparkles } from "lucide-react";
import { useFridge } from "@/lib/fridge-context";
import Stepper from "../components/stepper";
import RecipeCard from "../components/recipe-card";

const INITIAL_VISIBLE = 8;
const SHOW_MORE_STEP = 8;

export default function ResultsPage() {
  const router = useRouter();
  const { recipes, loadingRecipes, relaxed } = useFridge();
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  // A fresh search should re-collapse to the initial page size. Adjusting state
  // during render (rather than in an effect) avoids an extra render pass.
  const [renderedRecipes, setRenderedRecipes] = useState(recipes);
  if (recipes !== renderedRecipes) {
    setRenderedRecipes(recipes);
    setVisibleCount(INITIAL_VISIBLE);
  }

  return (
    <section className="mx-auto w-[min(1050px,calc(100%-48px))] pt-12 pb-20 max-[700px]:w-[min(100%-32px,1050px)]">
      <Stepper active={3} />

      <p className="mb-3 text-[11px] font-bold tracking-[0.13em] text-leaf">YOUR BEST MATCHES</p>
      <h2 className="text-[40px] font-bold tracking-[-0.04em]">Cook something brilliant.</h2>
      <p className="mt-3 mb-6 leading-[1.55] text-muted">
        Ranked to use what&apos;s already in your fridge — especially the ingredients that need you
        most.
      </p>

      {relaxed && recipes.length > 0 && (
        <div className="mt-2 mb-5 flex items-center gap-3 rounded-[10px] bg-alert-tint px-5 py-4 text-sm text-alert">
          <Flag size={14} /> <span>No recipe matched every filter — here are your closest options.</span>
        </div>
      )}

      {loadingRecipes ? (
        <div className="flex flex-col items-center rounded-[14px] bg-ash-100 px-5 py-16 text-center text-leaf">
          <Sparkles size={28} />
          <h3 className="mt-4 mb-2 text-2xl font-bold text-ink">Finding your best matches…</h3>
          <p className="mb-5 text-sm text-muted">Ranking recipes by what needs using first.</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center rounded-[14px] bg-ash-100 px-5 py-16 text-center text-leaf">
          <CircleDashed size={28} />
          <h3 className="mt-4 mb-2 text-2xl font-bold text-ink">No matches yet</h3>
          <p className="mb-5 text-sm text-muted">
            Try removing a filter or adding a few more ingredients.
          </p>
          <button
            className="inline-flex items-center gap-2 rounded-[10px] border border-transparent bg-leaf px-5 py-3 text-sm font-bold text-white shadow-[0_4px_10px_#27725c23] hover:bg-[#1d614d]"
            onClick={() => router.push("/preferences")}
          >
            Edit preferences
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-5 max-[700px]:grid-cols-1">
            {recipes.slice(0, visibleCount).map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
          {visibleCount < recipes.length && (
            <div className="mt-6 flex justify-center">
              <button
                className="inline-flex items-center gap-2 rounded-[10px] border border-line bg-white px-5 py-3 text-sm font-bold text-ink hover:bg-[#f1f6f1]"
                onClick={() => setVisibleCount((current) => current + SHOW_MORE_STEP)}
              >
                Show more
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-8 flex justify-between gap-3">
        <button
          className="inline-flex items-center gap-2 border-0 bg-transparent px-0 py-[10px] text-sm text-[#597066] hover:text-leaf"
          onClick={() => router.push("/preferences")}
        >
          <ArrowLeft size={14} /> Edit preferences
        </button>
      </div>
    </section>
  );
}
