"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
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
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-[10px] border border-line bg-white px-5 py-3 text-sm font-bold text-ink hover:bg-[#f1f6f1]"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <Plus size={16} /> Add ingredient
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+8px)] right-0 z-10 w-[260px] rounded-xl border border-line bg-ash-100 p-2.5 shadow-[0_10px_30px_rgba(32,52,45,0.14)]"
          role="listbox"
          aria-label="Choose an ingredient"
        >
          <input
            ref={inputRef}
            className="mb-2 w-full rounded-lg border border-line px-2.5 py-[9px] text-[13px]"
            placeholder="Search ingredients…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="flex max-h-[240px] flex-col gap-[2px] overflow-y-auto">
            {loading && <p className="px-2.5 py-[9px] text-[13px] text-muted">Loading…</p>}
            {!loading && loadError && (
              <p className="px-2.5 py-[9px] text-[13px] text-muted">Couldn&apos;t load ingredients.</p>
            )}
            {!loading && !loadError && filtered.length === 0 && (
              <p className="px-2.5 py-[9px] text-[13px] text-muted">No matches.</p>
            )}
            {!loading &&
              !loadError &&
              filtered.map((item) => {
                const alreadyAdded = existing.has(item.name.toLowerCase());
                return (
                  <button
                    type="button"
                    key={item.id}
                    className="flex items-center justify-between rounded-[7px] border-0 bg-transparent px-2.5 py-[9px] text-left text-[13px] text-ink enabled:hover:bg-pale disabled:cursor-not-allowed disabled:text-ash-500"
                    disabled={alreadyAdded}
                    onClick={() => pick(item.name)}
                  >
                    {capitalize(item.name)}
                    {alreadyAdded && <small className="text-[10px] text-ash-500">Already added</small>}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
