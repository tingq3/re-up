"use client";

import { useRouter } from "next/navigation";
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
    <section className="content narrow">
      <Stepper active={2} />

      <p className="eyebrow">MAKE IT YOURS</p>
      <h2>What are you in the mood for?</h2>
      <p className="lead">We&apos;ll use these to tailor your recipe matches.</p>

      <div className="preference">
        <label>Dietary requirements</label>
        <div className="chips">
          {DIETARY.map((item) => (
            <button
              key={item}
              className={dietary.includes(item) ? "selected" : ""}
              onClick={() => toggleDiet(item)}
            >
              {dietary.includes(item) ? "✓ " : "+ "}
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="preference">
        <label>Match strictness</label>
        <div className="chips">
          <button
            className={allowPartial ? "selected" : ""}
            onClick={() => setAllowPartial(!allowPartial)}
          >
            {allowPartial ? "✓ " : "+ "}
            Allow missing ingredients
          </button>
        </div>
        <p className="hint">
          {allowPartial
            ? "Showing recipes you can nearly make, with a shopping list for what's missing."
            : "Only showing recipes you can make right now with what's in your fridge."}
        </p>
      </div>

      <div className="preference grid-preferences">
        <div>
          <label>Meal type</label>
          <select value={mealType} onChange={(event) => setMealType(event.target.value)}>
            {MEAL_TYPES.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Cooking time</label>
          <select value={cookTime} onChange={(event) => setCookTime(event.target.value)}>
            {COOK_TIME_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Cuisine</label>
          <select value={cuisine} onChange={(event) => setCuisine(event.target.value)}>
            {CUISINES.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="footer-actions">
        <button className="text-button" onClick={() => router.push("/verify")}>
          ← Back
        </button>
        <button className="primary" onClick={onFind}>
          Find my recipes →
        </button>
      </div>
    </section>
  );
}
