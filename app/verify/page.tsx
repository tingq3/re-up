"use client";

import { useRouter } from "next/navigation";
import { URGENCIES, useFridge } from "@/lib/fridge-context";
import AddIngredient from "../components/add-ingredient";
import Stepper from "../components/stepper";

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
    <section className="content">
      <Stepper active={1} />

      <div className="section-heading">
        <div>
          <p className="eyebrow">HUMAN CHECK</p>
          <h2>{ingredients.length === 0 ? "What's in your fridge?" : "Does this look right?"}</h2>
          <p>
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
        <div className="notice">
          ⚑ <span>{analysisNote}</span>
        </div>
      )}

      {ingredients.length > 0 && (
        <div className="notice">
          ⚑{" "}
          <span>
            <b>
              {urgentCount} ingredient{urgentCount === 1 ? "" : "s"} marked urgent.
            </b>{" "}
            We&apos;ll prioritise them in your recipe matches.
          </span>
        </div>
      )}

      {ingredients.length === 0 && (
        <div className="empty">
          ◌<h3>No ingredients yet</h3>
          <p>Use &ldquo;+ Add ingredient&rdquo; above to start building your list.</p>
        </div>
      )}

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
        <button
          className="primary"
          disabled={!ingredients.some((item) => item.available)}
          onClick={() => router.push("/preferences")}
        >
          Continue to preferences →
        </button>
      </div>
    </section>
  );
}
