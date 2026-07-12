"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Circle, CircleDashed, Clock, Heart } from "lucide-react";
import { useFridge } from "@/lib/fridge-context";

export default function RecipeDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { recipes, saved, toggleSaved } = useFridge();

  const recipe = recipes.find((item) => item.id === Number(id));

  // Recipes live in client state only, so a direct load / refresh has nothing to show.
  if (!recipe) {
    return (
      <section className="mx-auto w-[min(1050px,calc(100%-48px))] pt-12 pb-20 max-[700px]:w-[min(100%-32px,1050px)]">
        <div className="flex flex-col items-center rounded-[14px] bg-ash-100 px-5 py-16 text-center text-leaf">
          <CircleDashed size={28} />
          <h3 className="mt-4 mb-2 text-2xl font-bold text-ink">Recipe not available</h3>
          <p className="mb-5 text-sm text-muted">
            Recipe matches aren&apos;t saved between visits — find them again to see the details.
          </p>
          <button
            className="inline-flex items-center gap-2 rounded-[10px] border border-transparent bg-leaf px-5 py-3 text-sm font-bold text-white shadow-[0_4px_10px_#27725c23] hover:bg-[#1d614d]"
            onClick={() => router.push("/results")}
          >
            Back to recipes
          </button>
        </div>
      </section>
    );
  }

  const isSaved = saved.includes(recipe.id);

  return (
    <section className="mx-auto w-[min(1050px,calc(100%-48px))] pt-12 pb-20 max-[700px]:w-[min(100%-32px,1050px)]">
      <button
        className="inline-flex items-center gap-2 border-0 bg-transparent px-0 py-[10px] text-sm text-[#597066] hover:text-leaf"
        onClick={() => router.push("/results")}
      >
        <ArrowLeft size={14} /> Back to recipes
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="my-6 h-[350px] w-full rounded-[15px] object-cover" src={recipe.image} alt="" />

      <div className="flex items-start justify-between gap-5 max-[700px]:flex-col max-[700px]:items-start">
        <div>
          <div className="flex flex-wrap gap-[5px]">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-[13px] bg-pale px-[7px] py-1 text-[10px] font-bold text-leaf"
              >
                {tag}
              </span>
            ))}
          </div>
          <h2 className="mt-3 mb-2 text-[40px] font-bold tracking-[-0.04em]">{recipe.name}</h2>
          <p className="flex items-center gap-1 text-sm text-muted">
            <Clock size={14} /> {recipe.time} min
          </p>
        </div>
        <button
          className={`inline-flex items-center gap-2 rounded-[9px] border border-line px-[14px] py-[10px] whitespace-nowrap ${isSaved ? "bg-favorite-tint text-favorite" : "bg-white text-[#526158]"}`}
          onClick={() => toggleSaved(recipe.id)}
        >
          <Heart size={14} fill={isSaved ? "currentColor" : "none"} />
          {isSaved ? "Saved" : "Save recipe"}
        </button>
      </div>

      <div className="mt-12 grid grid-cols-[1.55fr_0.85fr] gap-12 max-[700px]:grid-cols-1 max-[700px]:gap-[35px]">
        <div>
          <h3 className="mb-5 text-[23px] font-bold">Instructions</h3>
          <ol>
            {recipe.steps.map((step, index) => (
              <li key={step} className="mb-5 flex items-start gap-4">
                <b className="grid h-[29px] min-w-[29px] place-items-center rounded-full bg-leaf text-[13px] font-semibold text-white">
                  {index + 1}
                </b>
                <p className="mt-1 text-sm leading-[1.55] text-[#45564d]">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <aside className="self-start rounded-[13px] border border-line bg-ash-100 p-5">
          <h3 className="text-[23px] font-bold">
            Nutrition <small className="text-[11px] text-muted">per serving</small>
          </h3>
          <div className="flex items-center gap-5">
            <b className="text-[30px] font-bold text-leaf">
              {recipe.calories}
              <small className="text-[11px] text-muted"> kcal</small>
            </b>
            <div className="flex-1">
              <span className="flex justify-between py-[3px] text-xs text-muted">
                Protein <strong className="text-ink">{recipe.protein}g</strong>
              </span>
              <span className="flex justify-between py-[3px] text-xs text-muted">
                Carbs <strong className="text-ink">{recipe.carbs}g</strong>
              </span>
              <span className="flex justify-between py-[3px] text-xs text-muted">
                Fat <strong className="text-ink">{recipe.fat}g</strong>
              </span>
            </div>
          </div>

          <hr className="my-5 border-line" />

          <h3 className="text-[23px] font-bold">Ingredients</h3>
          <p className="mt-4 mb-2 text-[10px] font-bold tracking-[0.11em] text-leaf">YOU HAVE</p>
          {recipe.used.map((item) => (
            <p className="my-2 flex items-center justify-between gap-2 text-[13px]" key={item.name}>
              <span className="flex items-center gap-2">
                <Check size={14} /> {item.name}
              </span>
              {item.quantity && <span className="text-muted">{item.quantity}</span>}
            </p>
          ))}

          {recipe.missing.length > 0 && (
            <>
              <p className="mt-4 mb-2 text-[10px] font-bold tracking-[0.11em] text-alert">
                SHOPPING LIST
              </p>
              {recipe.missing.map((item) => (
                <p className="my-2 flex items-center justify-between gap-2 text-[13px]" key={item.name}>
                  <span className="flex items-center gap-2">
                    <Circle size={14} /> {item.name}
                  </span>
                  {item.quantity && <span className="text-muted">{item.quantity}</span>}
                </p>
              ))}
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
