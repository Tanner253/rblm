"use client";

import Image from "next/image";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { Meme } from "@/data/memes";

type Props = {
  meme: Meme;
  onClose: () => void;
  onCopyImage: () => void;
  onCopyCaption: () => void;
  onDownload: () => void;
  copied: "image" | "caption" | null;
  downloading: boolean;
};

export function MemePreview({
  meme,
  onClose,
  onCopyImage,
  onCopyCaption,
  onDownload,
  copied,
  downloading,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={meme.title}
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 bg-[var(--ink)]/75 backdrop-blur-sm veil-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-[min(96vw,900px)] max-h-[92vh] w-full flex flex-col gap-4"
      >
        <div
          className="relative flex-1 min-h-0 rounded-[1.25rem] overflow-hidden border border-white/10"
          style={{
            aspectRatio: meme.aspect,
            maxHeight: "calc(92vh - 120px)",
            background: "var(--cream)",
          }}
        >
          <Image
            src={meme.src}
            alt={meme.title}
            fill
            sizes="(min-width: 900px) 900px, 96vw"
            className="object-contain"
            priority
          />
        </div>

        {meme.caption && (
          <p className="text-white/85 text-sm whitespace-pre-line text-center max-w-xl mx-auto px-2 leading-relaxed">
            {meme.caption}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={onCopyImage}
            className={`btn-primary !text-xs sm:!text-sm ${copied === "image" ? "btn-success" : ""}`}
          >
            {copied === "image" ? "Copied" : "Copy image"}
          </button>
          {meme.caption && (
            <button
              type="button"
              onClick={onCopyCaption}
              className="btn-quiet !text-xs sm:!text-sm !border-white/25 !text-white hover:!bg-white/10"
            >
              {copied === "caption" ? "Caption copied" : "Copy caption"}
            </button>
          )}
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            className="btn-quiet !text-xs sm:!text-sm !border-white/25 !text-white hover:!bg-white/10"
          >
            {downloading ? "Downloading…" : "Download"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-quiet !text-xs sm:!text-sm !border-white/25 !text-white hover:!bg-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
