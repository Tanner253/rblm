"use client";

import { clsx } from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { memes, TEMPLATE_SRC } from "@/data/memes";
import type { Meme } from "@/data/memes";
import {
  CONTRACT_ADDRESS,
  DEXSCREENER_URL,
} from "@/lib/constants";
import {
  copyImageBlob,
  copyImageFromSrc,
  downloadBlob,
  downloadImageFromSrc,
} from "@/lib/clipboard";
import {
  computeTextLayerLayout,
  DEFAULT_LAYERS,
  layerDisplayText,
  layerIsEmpty,
  MEME_LETTER_SPACING_EM,
  renderMemeToBlob,
  type TextLayer,
} from "@/lib/exportCanvas";

const DRAG_THRESHOLD = 6;

const textStyle = {
  fontFamily: 'Impact, Haettenschweiler, "Arial Black", sans-serif',
  fontWeight: 900 as const,
  color: "#ffffff",
  WebkitTextStroke: "2px #000000",
  paintOrder: "stroke fill" as const,
  textTransform: "uppercase" as const,
  letterSpacing: `${MEME_LETTER_SPACING_EM}em`,
  lineHeight: 1.08,
  textAlign: "center" as const,
  overflowWrap: "anywhere" as const,
};

function snap(v: number) {
  if (Math.abs(v - 50) <= 3) return 50;
  return Math.min(100, Math.max(0, v));
}

function MemeTextLayer({
  layer,
  width,
  height,
  editing,
  onStartEdit,
  onEndEdit,
  onDraftChange,
  onDrag,
}: {
  layer: TextLayer;
  width: number;
  height: number;
  editing: boolean;
  onStartEdit: () => void;
  onEndEdit: (text: string) => void;
  onDraftChange: (text: string) => void;
  onDrag: (x: number, y: number) => void;
}) {
  const editRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    sx: number;
    sy: number;
    ox: number;
    oy: number;
    moved: boolean;
  } | null>(null);
  const [draftText, setDraftText] = useState(layer.text);

  const empty = layerIsEmpty(layer);
  const layoutSource = editing ? draftText : layer.text;
  const layout = useMemo(
    () => computeTextLayerLayout(layer, layoutSource, width, height),
    [layer, layoutSource, width, height]
  );
  const fontSize = layout.fontSize;

  useEffect(() => {
    if (!editing) return;
    setDraftText(layer.text);
    requestAnimationFrame(() => {
      const el = editRef.current;
      if (!el) return;
      el.textContent = layer.text;
      el.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    });
    // Only re-init when entering edit mode or switching layers — not on each keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, layer.id]);

  const onInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText.replace(/\s+/g, " ").trimStart();
    setDraftText(text);
    onDraftChange(text.trim());
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (editing) return;
    e.stopPropagation();
    dragRef.current = {
      sx: e.clientX,
      sy: e.clientY,
      ox: layer.x,
      oy: layer.y,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || editing) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    if (!d.moved) {
      d.moved = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    const stage = (e.currentTarget as HTMLElement).offsetParent as HTMLElement;
    const r = stage.getBoundingClientRect();
    onDrag(
      snap(d.ox + (dx / r.width) * 100),
      snap(d.oy + (dy / r.height) * 100)
    );
  };

  const onPointerUp = () => {
    const d = dragRef.current;
    if (!d) return;
    if (!d.moved) onStartEdit();
    dragRef.current = null;
  };

  return (
    <div
      className={clsx(
        "absolute px-0.5",
        editing ? "cursor-text z-10" : "cursor-grab active:cursor-grabbing",
        editing && "ring-1 ring-white/80 rounded-sm"
      )}
      style={{
        left: `${layer.x}%`,
        top: `${layer.y}%`,
        transform: "translate(-50%, -50%)",
        maxWidth: `${layer.maxWidth}%`,
        fontSize,
        transition: "font-size 0.12s ease-out",
        ...textStyle,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={(e) => e.stopPropagation()}
    >
      {editing ? (
        <div
          ref={editRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={layer.placeholder}
          className="outline-none whitespace-pre-wrap break-words meme-placeholder"
          onInput={onInput}
          onBlur={(e) =>
            onEndEdit(e.currentTarget.innerText.replace(/\s+/g, " ").trim())
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              editRef.current?.blur();
            }
          }}
        />
      ) : (
        <span className={clsx("block whitespace-pre-wrap", empty && "opacity-65")}>
          {layerDisplayText(layer)}
        </span>
      )}
    </div>
  );
}

export function MemeStudio() {
  const [layers, setLayers] = useState<TextLayer[]>(DEFAULT_LAYERS);
  const [editingId, setEditingId] = useState<TextLayer["id"] | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogFeedback, setCatalogFeedback] = useState<{
    slug: string;
    message: string;
  } | null>(null);
  const [stageSize, setStageSize] = useState({ width: 480, height: 480 });
  const stageRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef(layers);
  layersRef.current = layers;

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 2000);
    return () => clearTimeout(t);
  }, [status]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setStageSize({ width, height: height || width });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!catalogFeedback) return;
    const t = setTimeout(() => setCatalogFeedback(null), 1600);
    return () => clearTimeout(t);
  }, [catalogFeedback]);

  const patchLayer = (id: TextLayer["id"], patch: Partial<TextLayer>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const exportMeme = useCallback(async () => {
    setBusy(true);
    try {
      return await renderMemeToBlob(TEMPLATE_SRC, layersRef.current);
    } finally {
      setBusy(false);
    }
  }, []);

  const copyMeme = useCallback(async () => {
    try {
      const blob = await exportMeme();
      const result = await copyImageBlob(blob);
      if (result === "clipboard") setStatus("Copied");
      else if (result === "share") setStatus("Shared");
      else {
        downloadBlob(blob, "rblm.png");
        setStatus("Saved");
      }
    } catch {
      setStatus("Failed");
    }
  }, [exportMeme]);

  const downloadMeme = useCallback(async () => {
    try {
      downloadBlob(await exportMeme(), "rblm.png");
      setStatus("Saved");
    } catch {
      setStatus("Failed");
    }
  }, [exportMeme]);

  const copyCatalogMeme = useCallback(async (meme: Meme) => {
    try {
      const result = await copyImageFromSrc(meme.src, meme.slug);
      if (result === "clipboard") {
        setCatalogFeedback({ slug: meme.slug, message: "Copied!" });
        setStatus("Copied to clipboard");
      } else if (result === "share") {
        setCatalogFeedback({ slug: meme.slug, message: "Shared!" });
        setStatus("Opened share sheet");
      } else {
        setCatalogFeedback({ slug: meme.slug, message: "Use ↓" });
        setStatus("Copy blocked — use download");
      }
    } catch {
      setCatalogFeedback({ slug: meme.slug, message: "Failed" });
      setStatus("Failed");
    }
  }, []);

  const downloadCatalogMeme = useCallback(async (meme: Meme) => {
    try {
      await downloadImageFromSrc(meme.src, meme.slug);
      setStatus("Saved");
    } catch {
      setStatus("Failed");
    }
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 sm:px-6 shrink-0">
        <a
          href={DEXSCREENER_URL}
          target="_blank"
          rel="noreferrer"
          className="brand-shiny text-sm sm:text-base"
        >
          $RBLM
        </a>
        {!catalogOpen && (
          <button
            type="button"
            onClick={() => setCatalogOpen(true)}
            className="btn-catalog relative overflow-hidden rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white hover:bg-white/15 transition-colors"
          >
            <span className="relative z-[1]">Catalog</span>
          </button>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-3 pb-6 sm:px-6">
        <h1 className="site-title mb-6 sm:mb-8 max-w-sm text-center">
          <span className="block">You never know</span>
          <span className="block">who&apos;s behind the screen.</span>
        </h1>

        <div
          ref={stageRef}
          className="relative w-full max-w-[min(94vw,580px)] select-none"
          onClick={() => setEditingId(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={TEMPLATE_SRC}
            alt="Rabbit behind a lion mask at a laptop"
            className="block w-full h-auto rounded-sm shadow-[0_32px_64px_-16px_rgba(0,0,0,0.55)]"
            draggable={false}
          />

          {layers.map((layer) => (
            <MemeTextLayer
              key={layer.id}
              layer={layer}
              width={stageSize.width}
              height={stageSize.height}
              editing={editingId === layer.id}
              onStartEdit={() => setEditingId(layer.id)}
              onEndEdit={(text) => {
                patchLayer(layer.id, { text });
                setEditingId(null);
              }}
              onDraftChange={(text) => patchLayer(layer.id, { text })}
              onDrag={(x, y) => patchLayer(layer.id, { x, y })}
            />
          ))}
        </div>

        <div className="mt-5 w-full max-w-[min(94vw,580px)] flex gap-2">
          <button
            type="button"
            onClick={copyMeme}
            disabled={busy}
            className="flex-1 rounded-lg bg-white text-[#1a1816] py-2.5 text-sm font-semibold disabled:opacity-40"
          >
            Copy
          </button>
          <button
            type="button"
            onClick={downloadMeme}
            disabled={busy}
            className="flex-1 rounded-lg border border-white/20 py-2.5 text-sm text-white disabled:opacity-40"
          >
            Download
          </button>
        </div>

        {status && !catalogOpen && (
          <p className="mt-3 text-sm text-white/60 status-toast" aria-live="polite">
            {status}
          </p>
        )}
      </main>

      <footer className="site-footer shrink-0 px-4 py-5 text-center">
        CA: {CONTRACT_ADDRESS}
      </footer>

      {catalogOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 shrink-0 border-b border-white/10">
            <button
              type="button"
              onClick={() => setCatalogOpen(false)}
              className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back
            </button>
            <h2 className="text-sm font-medium text-white/90">Catalog</h2>
            <span className="w-14" aria-hidden />
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-8 sm:px-6 pt-4">
            <p className="text-white/40 text-xs mb-4 text-center">
              Tap image to copy
            </p>
            {status && (
              <p
                className="text-center text-sm text-white/80 mb-4 status-toast"
                aria-live="polite"
              >
                {status}
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
              {memes.map((m) => {
                const feedback =
                  catalogFeedback?.slug === m.slug
                    ? catalogFeedback.message
                    : null;
                return (
                  <div
                    key={m.slug}
                    className={clsx(
                      "relative group rounded-lg overflow-hidden ring-1 transition-all",
                      feedback
                        ? "ring-white/70"
                        : "ring-white/10 hover:ring-white/40"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => copyCatalogMeme(m)}
                      className="w-full text-left"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.src}
                        alt={m.title}
                        className="w-full block group-hover:opacity-90 transition-opacity"
                      />
                      <span className="block px-2 py-2 text-xs text-white/70 group-hover:text-white">
                        {m.title}
                      </span>
                    </button>
                    {feedback && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/65 pointer-events-none catalog-copied">
                        <span className="text-white font-semibold text-sm">
                          {feedback}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => downloadCatalogMeme(m)}
                      aria-label={`Download ${m.title}`}
                      className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white/90 hover:bg-black/75 hover:text-white transition-colors"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M12 3v12" />
                        <path d="m7 10 5 5 5-5" />
                        <path d="M5 21h14" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
