"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  COOK_TIME_OPTIONS,
  CUISINES,
  DIETARY,
  MEAL_TYPES,
  useFridge,
} from "@/lib/fridge-context";
import Stepper from "../components/stepper";

export default function PreferencesPage() {
  const router = useRouter();
  const {
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
    findRecipes,
  } = useFridge();

  const onFind = () => {
    // Kick off the fetch, then move to the results page which reads it from context.
    void findRecipes();
    router.push("/results");
  };

  return (
    <section className="mx-auto w-[min(720px,calc(100%-48px))] pt-12 pb-20">
      <Stepper active={2} />

      {/* <p className="mb-3 text-[11px] font-bold tracking-[0.13em] text-leaf">MAKE IT YOURS</p> */}
      <h2 className="text-[40px] font-bold tracking-[-0.04em]">What are you in the mood for?</h2>
      <p className="mt-3 mb-6 leading-[1.55] text-muted">
        We&apos;ll use these to tailor your recipe matches.
      </p>

      <div className="border-t border-line py-[25px]">
        <label className="mb-3 block text-sm font-bold text-ink">Dietary requirements</label>
        <div className="flex flex-wrap gap-2">
          {DIETARY.map((item) => (
            <button
              key={item}
              className={
                dietary.includes(item)
                  ? "rounded-lg border border-leaf bg-pale px-[15px] py-[10px] text-[13px] font-bold text-leaf"
                  : "rounded-lg border border-line bg-white px-[15px] py-[10px] text-[13px] text-[#526158]"
              }
              onClick={() => toggleDiet(item)}
            >
              {dietary.includes(item) ? "✓ " : "+ "}
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-line py-[25px]">
        <label className="mb-3 block text-sm font-bold text-ink">Match strictness</label>
        <div className="flex flex-wrap gap-2">
          <button
            className={
              allowPartial
                ? "rounded-lg border border-leaf bg-pale px-[15px] py-[10px] text-[13px] font-bold text-leaf"
                : "rounded-lg border border-line bg-white px-[15px] py-[10px] text-[13px] text-[#526158]"
            }
            onClick={() => setAllowPartial(!allowPartial)}
          >
            {allowPartial ? "✓ " : "+ "}
            Allow missing ingredients
          </button>
        </div>
        <p className="mt-3 text-[13px] text-muted">
          {allowPartial
            ? "Showing recipes you can nearly make, with a shopping list for what's missing."
            : "Only showing recipes you can make right now with what's in your fridge."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5 border-t border-line py-[25px] max-[700px]:grid-cols-1">
        <div>
          <label className="mb-3 block text-sm font-bold text-ink">Meal type</label>
          <select
            className="w-full rounded-lg border border-line bg-white p-3 text-ink"
            value={mealType}
            onChange={(event) => setMealType(event.target.value)}
          >
            {MEAL_TYPES.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-3 block text-sm font-bold text-ink">Cooking time</label>
          <select
            className="w-full rounded-lg border border-line bg-white p-3 text-ink"
            value={cookTime}
            onChange={(event) => setCookTime(event.target.value)}
          >
            {COOK_TIME_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-3 block text-sm font-bold text-ink">Cuisine</label>
          <select
            className="w-full rounded-lg border border-line bg-white p-3 text-ink"
            value={cuisine}
            onChange={(event) => setCuisine(event.target.value)}
          >
            {CUISINES.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 flex justify-between gap-3">
        <button
          className="inline-flex items-center gap-2 border-0 bg-transparent px-0 py-[10px] text-sm text-[#597066] hover:text-leaf"
          onClick={() => router.push("/verify")}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-[10px] border border-transparent bg-leaf px-5 py-3 text-sm font-bold text-white shadow-[0_4px_10px_#27725c23] hover:bg-[#1d614d]"
          onClick={onFind}
        >
          Find my recipes <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
