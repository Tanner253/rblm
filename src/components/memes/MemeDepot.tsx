"use client";

import { useMemo, useState } from "react";
import { MemeCard } from "./MemeCard";
import type { Meme } from "@/data/memes";

type Props = {
  memes: Meme[];
};

export function MemeDepot({ memes }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return memes;
    const q = query.toLowerCase();
    return memes.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.caption ?? "").toLowerCase().includes(q)
    );
  }, [memes, query]);

  return (
    <div className="flex flex-col gap-8">
      <div className="glass rounded-[1.25rem] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or caption…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border border-[var(--glass-line)] text-sm placeholder:text-[var(--ink-mute)] focus:outline-none focus:bg-white focus:border-[var(--accent)]/40 transition-colors"
          />
        </div>
        <p className="text-sm text-[var(--ink-mute)]">
          {filtered.length} meme{filtered.length === 1 ? "" : "s"}
          {query ? ` matching “${query}”` : ""}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[1.25rem] glass p-12 text-center">
          <p className="text-display text-xl font-semibold text-[var(--ink)]">
            Nothing here yet
          </p>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Try a different search, or make one in the maker.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((m, i) => (
            <MemeCard key={m.slug} meme={m} priority={i < 4} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
