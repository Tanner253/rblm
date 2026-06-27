import type { Metadata } from "next";
import Link from "next/link";
import { MemeDepot } from "@/components/memes/MemeDepot";
import { memes } from "@/data/memes";

export const metadata: Metadata = {
  title: "Meme Depot — RBLM",
  description: "Browse, copy, and download RBLM memes.",
};

export default function MemesPage() {
  return (
    <div className="px-4 pt-4 sm:pt-8 pb-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 sm:mb-12 max-w-2xl">
          <p className="text-sm text-[var(--ink-mute)]">catalog · copy · download</p>
          <h1 className="text-display text-4xl sm:text-5xl font-semibold mt-3 text-[var(--ink)]">
            Meme depot
          </h1>
          <p className="mt-4 text-[var(--ink-soft)] leading-relaxed">
            Click a meme to preview full size.{" "}
            <span className="text-[var(--ink)]">Copy image</span> puts it on
            your clipboard — on mobile we fall back to the share sheet when
            needed.
          </p>
          <Link
            href="/create"
            className="link-underline inline-block mt-4 text-sm font-medium text-[var(--accent)]"
          >
            Or make your own →
          </Link>
        </header>

        <MemeDepot memes={memes} />
      </div>
    </div>
  );
}
