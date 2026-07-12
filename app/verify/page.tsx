"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CircleDashed, Flag, X } from "lucide-react";
import { URGENCIES, useFridge } from "@/lib/fridge-context";
import AddIngredient from "../components/add-ingredient";
import Stepper from "../components/stepper";

const URGENCY_SELECTED_CLASSES: Record<string, string> = {
  Urgent: "border-status-urgent-line bg-status-urgent-tint text-status-urgent font-bold",
  Soon: "border-status-soon-line bg-status-soon-tint text-status-soon font-bold",
  Fresh: "border-status-fresh-line bg-status-fresh-tint text-status-fresh font-bold",
};

export default function VerifyPage() {
  const router = useRouter();
  const {
    ingredients,
    urgentCount,
    analysisNote,
    addIngredient,
    removeIngredient,
    toggleAvailable,
    setQuantity,
    setUrgency,
  } = useFridge();

  return (
    <section className="mx-auto w-[min(1050px,calc(100%-48px))] pt-12 pb-20 max-[700px]:w-[min(100%-32px,1050px)]">
      <Stepper active={1} />

      <div className="flex items-end justify-between gap-5 max-[700px]:flex-col max-[700px]:items-start">
        <div>
          {/* <p className="mb-3 text-[11px] font-bold tracking-[0.13em] text-leaf">HUMAN CHECK</p> */}
          <h2 className="text-[40px] font-bold tracking-[-0.04em]">
            {ingredients.length === 0 ? "What's in your fridge?" : "Does this look right?"}
          </h2>
          <p className="mt-3 mb-6 leading-[1.55] text-muted">
            {ingredients.length === 0
              ? "Add ingredients one by one using the button on the right."
              : "We found these in your fridge. Make any changes before we create your recipes."}
          </p>
        </div>
        <AddIngredient
          existingNames={ingredients.map((item) => item.name)}
          onAdd={addIngredient}
        />
      </div>

      {analysisNote && (
        <div className="mt-2 mb-5 flex items-center gap-3 rounded-[10px] bg-alert-tint px-5 py-4 text-sm text-alert">
          <Flag size={14} /> <span>{analysisNote}</span>
        </div>
      )}

      {ingredients.length > 0 && (
        <div className="mt-2 mb-5 flex items-center gap-3 rounded-[10px] bg-alert-tint px-5 py-4 text-sm text-alert">
          <Flag size={14} />{" "}
          <span>
            <b>
              {urgentCount} ingredient{urgentCount === 1 ? "" : "s"} marked urgent.
            </b>{" "}
            We&apos;ll prioritise them in your recipe matches.
          </span>
        </div>
      )}

      {ingredients.length === 0 && (
        <div className="flex flex-col items-center rounded-[14px] bg-ash-100 px-5 py-16 text-center text-leaf">
          <CircleDashed size={28} />
          <h3 className="mt-4 mb-2 text-2xl font-bold text-ink">No ingredients yet</h3>
          <p className="mb-5 text-sm text-muted">
            Use &ldquo;+ Add ingredient&rdquo; above to start building your list.
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-[14px] border border-line bg-ash-100">
        {ingredients.map((ingredient) => (
          <div
            className={`flex min-h-[68px] items-center gap-3 border-b border-ash-250 px-4 py-3 last:border-0 max-[700px]:flex-wrap max-[700px]:gap-2 max-[700px]:p-2.5 ${ingredient.available ? "" : "opacity-[0.48]"}`}
            key={ingredient.id}
          >
            <button
              className={`flex h-[22px] w-[22px] items-center justify-center rounded-md border text-white ${ingredient.available ? "border-leaf bg-leaf" : "border-ash-500 bg-white"}`}
              onClick={() => toggleAvailable(ingredient.id)}
            >
              <Check size={14} />
            </button>

            <div className="flex flex-1 flex-col gap-1">
              <b className="text-sm">{ingredient.name}</b>
              <small className="text-[11px] text-muted">
                {ingredient.urgency === "Urgent" ? "Use today" : `${ingredient.days} days left`}
              </small>
            </div>

            <input
              className="w-[100px] rounded-[7px] border border-line px-2 py-[7px] text-[13px] max-[700px]:w-[76px]"
              value={ingredient.quantity}
              onChange={(event) => setQuantity(ingredient.id, event.target.value)}
            />

            <div
              className="grid w-[236px] grid-cols-3 gap-[5px] rounded-[10px] border border-ash-400 bg-ash-200 p-1 max-[700px]:flex-1"
              aria-label={`Set urgency for ${ingredient.name}`}
            >
              {URGENCIES.map((urgency) => (
                <button
                  key={urgency}
                  className={`min-h-[32px] rounded-md border bg-white px-[7px] py-[6px] text-[11px] font-semibold text-[#66766c] transition-colors duration-150 hover:border-[#99b7a2] max-[700px]:flex-1 ${ingredient.urgency === urgency ? URGENCY_SELECTED_CLASSES[urgency] : "border-ash-400"}`}
                  onClick={() => setUrgency(ingredient.id, urgency)}
                >
                  {urgency}
                </button>
              ))}
            </div>

            <button
              className="flex items-center text-ash-550"
              onClick={() => removeIngredient(ingredient.id)}
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between gap-3">
        <button
          className="inline-flex items-center gap-2 border-0 bg-transparent px-0 py-[10px] text-sm text-[#597066] hover:text-leaf"
          onClick={() => router.push("/")}
        >
          <ArrowLeft size={14} /> Start over
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-[10px] border border-transparent bg-leaf px-5 py-3 text-sm font-bold text-white shadow-[0_4px_10px_#27725c23] hover:bg-[#1d614d] disabled:cursor-not-allowed disabled:bg-ash-500 disabled:shadow-none disabled:hover:bg-ash-500"
          disabled={!ingredients.some((item) => item.available)}
          onClick={() => router.push("/preferences")}
        >
          Continue to preferences <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
