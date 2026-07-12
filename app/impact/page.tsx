"use client";

import { CircleDashed, DollarSign, Leaf, ShoppingBasket } from "lucide-react";
import { useFridge } from "@/lib/fridge-context";

const currency = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });

export default function ImpactPage() {
  const { recipes, cooked } = useFridge();
  const completed = recipes.filter((recipe) => cooked.includes(recipe.id));
  const avoidedPurchase = completed.reduce((sum, recipe) => sum + recipe.estimatedSavings.avoidedPurchase, 0);
  const avoidedWaste = completed.reduce((sum, recipe) => sum + recipe.estimatedSavings.avoidedWaste, 0);

  return (
    <section className="mx-auto w-[min(850px,calc(100%-48px))] pt-12 pb-20 max-[700px]:w-[min(100%-32px,850px)]">
      <p className="mb-3 text-[11px] font-bold tracking-[0.13em] text-leaf">YOUR KITCHEN IMPACT</p>
      <h1 className="text-[40px] font-bold tracking-[-0.04em]">Good food, put to good use.</h1>
      <p className="mt-3 max-w-[620px] leading-[1.55] text-muted">
        These are estimated Australian-dollar savings from recipes you&apos;ve marked as cooked, based on the ingredient amounts and average prices in your pantry catalogue.
      </p>

      {completed.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-[14px] bg-ash-100 px-5 py-16 text-center text-leaf">
          <CircleDashed size={28} />
          <h2 className="mt-4 text-2xl font-bold text-ink">Your impact starts with a meal</h2>
          <p className="mt-2 text-sm text-muted">Open a recipe and choose “Cooked this” to record the ingredients you rescued.</p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-5 max-[700px]:grid-cols-1">
            <article className="rounded-[14px] border border-line bg-ash-100 p-6">
              <ShoppingBasket className="text-leaf" size={22} />
              <p className="mt-5 text-sm text-muted">Not spent on ingredients already at home</p>
              <p className="mt-2 text-[38px] font-bold tracking-[-0.04em] text-leaf">{currency.format(avoidedPurchase)}</p>
            </article>
            <article className="rounded-[14px] border border-line bg-ash-100 p-6">
              <Leaf className="text-leaf" size={22} />
              <p className="mt-5 text-sm text-muted">Value of urgent ingredients kept out of the bin</p>
              <p className="mt-2 text-[38px] font-bold tracking-[-0.04em] text-leaf">{currency.format(avoidedWaste)}</p>
            </article>
          </div>
          <h2 className="mt-10 text-2xl font-bold">Meals you rescued</h2>
          <div className="mt-4 overflow-hidden rounded-[14px] border border-line">
            {completed.map((recipe) => (
              <div className="flex items-center justify-between gap-4 border-b border-line bg-white px-5 py-4 last:border-0" key={recipe.id}>
                <span className="font-bold">{recipe.name}</span>
                <span className="flex items-center gap-1 text-sm text-leaf"><DollarSign size={14} />{currency.format(recipe.estimatedSavings.avoidedPurchase)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
