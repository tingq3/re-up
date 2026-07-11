import Link from "next/link";
import type { RecipeMatch } from "@/lib/types";

type Props = {
  recipe: RecipeMatch;
  /** Compact cards (favourites grid) hide the score, tags and match summary. */
  compact?: boolean;
};

export default function RecipeCard({ recipe, compact = false }: Props) {
  return (
    <Link className="recipe-card" href={`/recipe/${recipe.id}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={recipe.image} alt="" />
      {!compact && <div className="score">{recipe.score}% match</div>}
      <div className="card-body">
        {compact ? (
          <>
            <h3>{recipe.name}</h3>
            <p>◷ {recipe.time} min</p>
          </>
        ) : (
          <>
            <div className="tags">
              {recipe.tags.slice(0, 2).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <h3>{recipe.name}</h3>
            <p>◷ {recipe.time} min &nbsp; · &nbsp; ★ 4.8</p>
            <div className="uses">✓ Uses {recipe.used.length} fridge ingredients</div>
          </>
        )}
      </div>
    </Link>
  );
}
