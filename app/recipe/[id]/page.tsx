"use client";

import { useParams, useRouter } from "next/navigation";
import { useFridge } from "@/lib/fridge-context";

export default function RecipeDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { recipes, saved, toggleSaved } = useFridge();

  const recipe = recipes.find((item) => item.id === Number(id));

  // Recipes live in client state only, so a direct load / refresh has nothing to show.
  if (!recipe) {
    return (
      <section className="content">
        <div className="empty">
          ◌<h3>Recipe not available</h3>
          <p>Recipe matches aren&apos;t saved between visits — find them again to see the details.</p>
          <button className="primary" onClick={() => router.push("/results")}>
            Back to recipes
          </button>
        </div>
      </section>
    );
  }

  const isSaved = saved.includes(recipe.id);

  return (
    <section className="content detail">
      <button className="text-button" onClick={() => router.push("/results")}>
        ← Back to recipes
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hero-image" src={recipe.image} alt="" />

      <div className="detail-title">
        <div>
          <div className="tags">
            {recipe.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <h2>{recipe.name}</h2>
          <p>
            ◷ {recipe.time} min &nbsp; · &nbsp; Easy &nbsp; · &nbsp; ★ 4.8 &nbsp; · &nbsp; 4 servings
          </p>
        </div>
        <button
          className={`save ${isSaved ? "saved" : ""}`}
          onClick={() => toggleSaved(recipe.id)}
        >
          {isSaved ? "♥ Saved" : "♡ Save recipe"}
        </button>
      </div>

      <div className="detail-grid">
        <div>
          <h3>Instructions</h3>
          <ol>
            {recipe.steps.map((step, index) => (
              <li key={step}>
                <b>{index + 1}</b>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <aside>
          <h3>
            Nutrition <small>per serving</small>
          </h3>
          <div className="nutrition">
            <b>
              {recipe.calories}
              <small> kcal</small>
            </b>
            <div>
              <span>
                Protein <strong>{recipe.protein}g</strong>
              </span>
              <span>
                Carbs <strong>{recipe.carbs}g</strong>
              </span>
              <span>
                Fat <strong>{recipe.fat}g</strong>
              </span>
            </div>
          </div>

          <hr />

          <h3>Ingredients</h3>
          <p className="have">YOU HAVE</p>
          {recipe.used.map((item) => (
            <p className="item" key={item}>
              ✓ {item}
            </p>
          ))}

          {recipe.missing.length > 0 && (
            <>
              <p className="need">SHOPPING LIST</p>
              {recipe.missing.map((item) => (
                <p className="item" key={item}>
                  ⊙ {item}
                </p>
              ))}
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
