"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useFridge } from "@/lib/fridge-context";

// "AI vision at work" screen shown while the fridge photo is analysed by Gemini
// (see lib/vision.ts). Forwards to the ingredient check once analysis settles; the
// demo path (no analysis in flight) simply forwards after the minimum display time.
export default function AnalyzingPage() {
  const router = useRouter();
  const { analyzing } = useFridge();

  useEffect(() => {
    if (analyzing) return;
    // Small min-display so a fast/instant result doesn't flash the spinner.
    const timer = window.setTimeout(() => router.replace("/verify"), 400);
    return () => window.clearTimeout(timer);
  }, [analyzing, router]);

  return (
    <section className="px-6 py-[150px] text-center">
      <div className="mx-auto mb-6 grid h-[68px] w-[68px] place-items-center rounded-[23px] bg-pale text-leaf animate-[throb_1s_infinite_alternate]">
        <Sparkles size={28} />
      </div>
      <p className="mb-3 text-[11px] font-bold tracking-[0.13em] text-leaf">ANALYSING PHOTO</p>
      <h1 className="text-[45px] leading-[1.05] font-bold tracking-[-0.045em]">
        Looking inside your fridge…
      </h1>
      <p className="text-muted">
        Identifying ingredients, quantities, and the things that need using soon.
      </p>
      <div className="mx-auto my-8 h-[7px] w-[260px] overflow-hidden rounded-[9px] bg-ash-300">
        <i className="block h-full w-[65%] rounded-[inherit] bg-leaf animate-[progress_1.3s_ease-in-out_infinite]" />
      </div>
    </section>
  );
}
