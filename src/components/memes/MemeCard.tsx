"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { clsx } from "clsx";
import type { Meme } from "@/data/memes";
import {
  copyImageBlob,
  copyText,
  downloadBlob,
} from "@/lib/clipboard";
import { MemePreview } from "./MemePreview";

type Props = {
  meme: Meme;
  priority?: boolean;
  index?: number;
};

export function MemeCard({ meme, priority, index = 0 }: Props) {
  const [copied, setCopied] = useState<"image" | "caption" | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pop, setPop] = useState(false);

  const flash = (kind: "image" | "caption") => {
    setCopied(kind);
    setPop(true);
    setTimeout(() => {
      setCopied(null);
      setPop(false);
    }, 1600);
  };

  const copyImage = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(meme.src);
      const blob = await res.blob();
      const result = await copyImageBlob(blob);
      if (result === "failed") {
        setError("Copy blocked — try Download or Share on mobile.");
        return;
      }
      flash("image");
    } catch {
      setError("Couldn't copy. Try download instead.");
    }
  }, [meme.src]);

  const copyCaption = useCallback(async () => {
    if (!meme.caption) return;
    const ok = await copyText(meme.caption);
    if (ok) flash("caption");
    else setError("Couldn't copy caption.");
  }, [meme.caption]);

  const download = useCallback(async () => {
    setDownloading(true);
    try {
      const res = await fetch(meme.src);
      const blob = await res.blob();
      const ext = meme.src.split(".").pop() || "png";
      downloadBlob(blob, `rblm-${meme.slug}.${ext}`);
    } finally {
      setDownloading(false);
    }
  }, [meme.src, meme.slug]);

  return (
    <article
      className="meme-card group flex flex-col overflow-hidden rounded-[1.25rem] border border-[var(--glass-line)] bg-white/60 rise-in"
      style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
    >
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        aria-label={`Preview ${meme.title}`}
        className="relative w-full overflow-hidden block cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        style={{
          aspectRatio: 1,
          background:
            "linear-gradient(145deg, var(--cream) 0%, #fff 50%, var(--wall) 140%)",
        }}
      >
        <Image
          src={meme.src}
          alt={meme.title}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <span className="pointer-events-none absolute inset-0 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-[11px] text-white bg-[var(--ink)]/70 px-3 py-1 rounded-full backdrop-blur-sm">
            View full size
          </span>
        </span>
      </button>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="font-semibold text-[var(--ink)] leading-snug">
          {meme.title}
        </h3>

        {meme.caption && (
          <p className="text-sm text-[var(--ink-soft)] line-clamp-2 whitespace-pre-line leading-relaxed">
            {meme.caption}
          </p>
        )}

        <div
          className={clsx(
            "mt-auto flex flex-wrap items-center gap-2 pt-1",
            pop && "copy-pop"
          )}
        >
          <button
            type="button"
            onClick={copyImage}
            className={clsx(
              "btn-primary !py-1.5 !px-3 !text-xs",
              copied === "image" && "btn-success"
            )}
          >
            {copied === "image" ? "Copied" : "Copy image"}
          </button>
          {meme.caption && (
            <button
              type="button"
              onClick={copyCaption}
              className={clsx(
                "btn-quiet !py-1.5 !px-3 !text-xs",
                copied === "caption" &&
                  "!border-[var(--success)] !text-[var(--success)]"
              )}
            >
              {copied === "caption" ? "Caption copied" : "Copy caption"}
            </button>
          )}
          <button
            type="button"
            onClick={download}
            disabled={downloading}
            className="btn-quiet !py-1.5 !px-3 !text-xs ml-auto"
            aria-label="Download"
          >
            {downloading ? "…" : "Download"}
          </button>
        </div>

        {error && (
          <p className="text-xs text-[var(--accent)]">{error}</p>
        )}
      </div>

      {previewOpen && (
        <MemePreview
          meme={meme}
          onClose={() => setPreviewOpen(false)}
          onCopyImage={copyImage}
          onCopyCaption={copyCaption}
          onDownload={download}
          copied={copied}
          downloading={downloading}
        />
      )}
    </article>
  );
}
