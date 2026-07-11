"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Transient "AI vision at work" screen. Simulates the fridge-photo analysis,
// then forwards to the ingredient check. (Gemini vision is not wired up yet —
// see the follow-ups in CLAUDE.md.)
export default function AnalyzingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => router.replace("/verify"), 1300);
    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <section className="analyzing">
      <div className="pulse">✦</div>
      <p className="eyebrow">AI VISION AT WORK</p>
      <h1>Looking inside your fridge…</h1>
      <p>Identifying ingredients, quantities, and the things that need using soon.</p>
      <div className="progress">
        <i />
      </div>
    </section>
  );
}
