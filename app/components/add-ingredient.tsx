"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CanonicalIngredient } from "@/lib/types";

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

type AddIngredientProps = {
  existingNames: string[]; // already-added ingredient names, for disabling duplicates
  onAdd: (name: string) => void;
};

/**
 * "+ Add ingredient" control for /verify. Opens a searchable picker over the
 * canonical ingredient catalogue instead of inserting a placeholder row, so
 * every manually-added ingredient is guaranteed to resolve during matching.
 */
export default function AddIngredient({ existingNames, onAdd }: AddIngredientProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // null = not fetched yet (renders as loading); [] is a legitimate empty catalogue.
  const [catalog, setCatalog] = useState<CanonicalIngredient[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const fetchStarted = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || fetchStarted.current) return;
    fetchStarted.current = true;
    fetch("/api/ingredients")
      .then((response) => {
        if (!response.ok) throw new Error(`ingredients fetch failed: ${response.status}`);
        return response.json() as Promise<{ ingredients?: CanonicalIngredient[] }>;
      })
      .then((data) => setCatalog(data.ingredients ?? []))
      .catch(() => setLoadError(true));
  }, [open]);

  const loading = open && catalog === null && !loadError;

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const existing = useMemo(() => new Set(existingNames.map((name) => name.toLowerCase())), [existingNames]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const items = catalog ?? [];
    return (term ? items.filter((item) => item.name.includes(term)) : items).slice(0, 8);
  }, [catalog, query]);

  const pick = (name: string) => {
    onAdd(capitalize(name));
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="add-ingredient" ref={rootRef}>
      <button
        type="button"
        className="secondary"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        + Add ingredient
      </button>

      {open && (
        <div className="ingredient-picker" role="listbox" aria-label="Choose an ingredient">
          <input
            ref={inputRef}
            className="ingredient-picker-search"
            placeholder="Search ingredients…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="ingredient-picker-list">
            {loading && <p className="ingredient-picker-empty">Loading…</p>}
            {!loading && loadError && (
              <p className="ingredient-picker-empty">Couldn&apos;t load ingredients.</p>
            )}
            {!loading && !loadError && filtered.length === 0 && (
              <p className="ingredient-picker-empty">No matches.</p>
            )}
            {!loading &&
              !loadError &&
              filtered.map((item) => {
                const alreadyAdded = existing.has(item.name.toLowerCase());
                return (
                  <button
                    type="button"
                    key={item.id}
                    className="ingredient-picker-item"
                    disabled={alreadyAdded}
                    onClick={() => pick(item.name)}
                  >
                    {capitalize(item.name)}
                    {alreadyAdded && <small>Already added</small>}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
