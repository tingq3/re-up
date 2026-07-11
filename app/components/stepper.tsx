import { Fragment } from "react";

const STEPS = ["Check ingredients", "Your preferences", "Recipes"];

/** Progress header shared by /verify, /preferences and /results. `active` is 1-based. */
export default function Stepper({ active }: { active: 1 | 2 | 3 }) {
  return (
    <div className="stepper">
      {STEPS.map((label, index) => (
        <Fragment key={label}>
          <span className={active === index + 1 ? "active" : ""}>
            {index + 1}. {label}
          </span>
          {index < STEPS.length - 1 && <i />}
        </Fragment>
      ))}
    </div>
  );
}
