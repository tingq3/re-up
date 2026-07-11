"use client";

import { useRouter } from "next/navigation";
import { URGENCIES, useFridge } from "@/lib/fridge-context";
import Stepper from "../components/stepper";

export default function VerifyPage() {
  const router = useRouter();
  const {
    ingredients,
    urgentCount,
    addIngredient,
    removeIngredient,
    toggleAvailable,
    setQuantity,
    setUrgency,
  } = useFridge();

  return (
    <section className="content">
      <Stepper active={1} />

      <div className="section-heading">
        <div>
          <p className="eyebrow">HUMAN CHECK</p>
          <h2>Does this look right?</h2>
          <p>We found these in your fridge. Make any changes before we create your recipes.</p>
        </div>
        <button className="secondary" onClick={addIngredient}>
          + Add ingredient
        </button>
      </div>

      <div className="notice">
        ⚑{" "}
        <span>
          <b>
            {urgentCount} ingredient{urgentCount === 1 ? "" : "s"} marked urgent.
          </b>{" "}
          We&apos;ll prioritise them in your recipe matches.
        </span>
      </div>

      <div className="ingredient-list">
        {ingredients.map((ingredient) => (
          <div
            className={`ingredient ${ingredient.available ? "" : "unavailable"}`}
            key={ingredient.id}
          >
            <button
              className={`check ${ingredient.available ? "checked" : ""}`}
              onClick={() => toggleAvailable(ingredient.id)}
            >
              ✓
            </button>

            <div className="ingredient-name">
              <b>{ingredient.name}</b>
              <small>
                {ingredient.urgency === "Urgent" ? "Use today" : `${ingredient.days} days left`}
              </small>
            </div>

            <input
              value={ingredient.quantity}
              onChange={(event) => setQuantity(ingredient.id, event.target.value)}
            />

            <div className="urgency-selector" aria-label={`Set urgency for ${ingredient.name}`}>
              {URGENCIES.map((urgency) => (
                <button
                  key={urgency}
                  className={
                    ingredient.urgency === urgency ? `selected ${urgency.toLowerCase()}` : ""
                  }
                  onClick={() => setUrgency(ingredient.id, urgency)}
                >
                  {urgency}
                </button>
              ))}
            </div>

            <button className="delete" onClick={() => removeIngredient(ingredient.id)}>
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="footer-actions">
        <button className="text-button" onClick={() => router.push("/")}>
          ← Start over
        </button>
        <button className="primary" onClick={() => router.push("/preferences")}>
          Continue to preferences →
        </button>
      </div>
    </section>
  );
}
