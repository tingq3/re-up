import { Fragment } from "react";

const STEPS = ["Check ingredients", "Your preferences", "Recipes"];

/** Progress header shared by /verify, /preferences and /results. `active` is 1-based. */
export default function Stepper({ active }: { active: 1 | 2 | 3 }) {
  return (
    <div className="mb-12 flex items-center gap-3 text-xs text-ash-600 max-[700px]:overflow-hidden max-[700px]:whitespace-nowrap">
      {STEPS.map((label, index) => (
        <Fragment key={label}>
          <span className={active === index + 1 ? "font-bold text-leaf" : ""}>
            {index + 1}. {label}
          </span>
          {index < STEPS.length - 1 && (
            <i className="h-px w-[50px] bg-line max-[700px]:min-w-[18px]" />
          )}
        </Fragment>
      ))}
    </div>
  );
}
