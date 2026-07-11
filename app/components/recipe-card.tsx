import Link from "next/link";
import { Check, Clock } from "lucide-react";
import type { RecipeMatch } from "@/lib/types";

type Props = {
  recipe: RecipeMatch;
  /** Compact cards (favourites grid) hide the score, tags and match summary. */
  compact?: boolean;
};

export default function RecipeCard({ recipe, compact = false }: Props) {
  return (
    <Link
      className="relative block cursor-pointer overflow-hidden rounded-[14px] border border-line bg-ash-100 text-inherit no-underline transition-[transform,box-shadow] duration-[180ms] hover:-translate-y-[3px] hover:shadow-[0_12px_28px_#24473413]"
      href={`/recipe/${recipe.id}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="block h-[170px] w-full object-cover" src={recipe.image} alt="" />
      {!compact && (
        <div className="absolute top-3 left-3 rounded-[20px] bg-leaf px-[9px] py-[6px] text-[11px] font-bold text-white">
          {recipe.score}% match
        </div>
      )}
      <div className="p-4">
        {compact ? (
          <>
            <h3 className="mt-3 mb-2 text-xl font-bold">{recipe.name}</h3>
            <p className="flex items-center gap-1 text-xs text-muted">
              <Clock size={13} /> {recipe.time} min
            </p>
          </>
        ) : (
          <>
            <div className="flex flex-wrap gap-[5px]">
              {recipe.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-[13px] bg-pale px-[7px] py-1 text-[10px] font-bold text-leaf"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="mt-3 mb-2 text-xl font-bold">{recipe.name}</h3>
            <p className="flex items-center gap-1 text-xs text-muted">
              <Clock size={13} /> {recipe.time} min
            </p>
            <div className="mt-4 flex items-center gap-1 border-t border-ash-250 pt-3 text-xs font-bold text-leaf">
              <Check size={13} /> Uses {recipe.used.length} fridge ingredients
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
