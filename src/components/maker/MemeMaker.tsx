"use client";

import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StatusLine } from "@/components/site/StatusLine";
import { memeTemplates } from "@/data/memes";
import {
  copyImageBlob,
  downloadBlob,
} from "@/lib/clipboard";
import {
  createTextLayer,
  renderMemeToBlob,
  type TextLayer,
} from "@/lib/exportCanvas";

const SNAP = 3;

function snap(value: number) {
  if (Math.abs(value - 50) <= SNAP) return 50;
  if (value <= SNAP) return 0;
  if (value >= 100 - SNAP) return 100;
  return value;
}

export function MemeMaker() {
  const template = memeTemplates[0];
  const [layers, setLayers] = useState<TextLayer[]>(() =>
    template.defaultLayers.map((d) =>
      createTextLayer({
        text: d.text,
        y: d.y,
        scale: d.scale,
        x: 50,
        align: "center",
      })
    )
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    () => layers[0]?.id ?? null
  );
  const [history, setHistory] = useState<TextLayer[][]>([]);
  const [future, setFuture] = useState<TextLayer[][]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showGuides, setShowGuides] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef(layers);
  layersRef.current = layers;
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    lastX: number;
    lastY: number;
    snapshot: TextLayer[];
  } | null>(null);

  const selected = useMemo(
    () => layers.find((l) => l.id === selectedId) ?? null,
    [layers, selectedId]
  );

  const pushHistory = useCallback((prev: TextLayer[]) => {
    setHistory((h) => [...h.slice(-24), prev]);
    setFuture([]);
  }, []);

  const updateLayers = useCallback(
    (updater: (prev: TextLayer[]) => TextLayer[]) => {
      setLayers((prev) => {
        pushHistory(prev);
        return updater(prev);
      });
    },
    [pushHistory]
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      setFuture((f) => [layers, ...f]);
      setLayers(prev);
      return h.slice(0, -1);
    });
  }, [layers]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (!f.length) return f;
      const next = f[0];
      setHistory((h) => [...h, layers]);
      setLayers(next);
      return f.slice(1);
    });
  }, [layers]);

  const updateSelected = useCallback(
    (patch: Partial<TextLayer>) => {
      if (!selectedId) return;
      updateLayers((prev) =>
        prev.map((l) => (l.id === selectedId ? { ...l, ...patch } : l))
      );
    },
    [selectedId, updateLayers]
  );

  const addLayer = useCallback(
    (partial?: Partial<TextLayer>) => {
      const layer = createTextLayer(partial);
      updateLayers((prev) => [...prev, layer]);
      setSelectedId(layer.id);
    },
    [updateLayers]
  );

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    updateLayers((prev) => prev.filter((l) => l.id !== selectedId));
    setSelectedId(null);
  }, [selectedId, updateLayers]);

  const exportMeme = useCallback(async () => {
    setExporting(true);
    try {
      return await renderMemeToBlob(template.src, layers);
    } finally {
      setExporting(false);
    }
  }, [layers, template.src]);

  const copyMeme = useCallback(async () => {
    try {
      const blob = await exportMeme();
      const result = await copyImageBlob(blob);
      if (result === "clipboard") setStatus("Copied to clipboard");
      else if (result === "share") setStatus("Opened share sheet");
      else {
        downloadBlob(blob, "rblm-meme.png");
        setStatus("Clipboard blocked — downloaded instead");
      }
    } catch {
      setStatus("Export failed — try again");
    }
  }, [exportMeme]);

  const downloadMeme = useCallback(async () => {
    try {
      const blob = await exportMeme();
      downloadBlob(blob, "rblm-meme.png");
      setStatus("Downloaded PNG");
    } catch {
      setStatus("Export failed — try again");
    }
  }, [exportMeme]);

  const onPointerDown = (
    e: React.PointerEvent,
    id: string,
    x: number,
    y: number
  ) => {
    e.stopPropagation();
    setSelectedId(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      originX: x,
      originY: y,
      lastX: x,
      lastY: y,
      snapshot: layersRef.current.map((l) => ({ ...l })),
    };
    setShowGuides(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    const box = canvasRef.current;
    if (!drag || !box) return;
    const rect = box.getBoundingClientRect();
    const dx = ((e.clientX - drag.startX) / rect.width) * 100;
    const dy = ((e.clientY - drag.startY) / rect.height) * 100;
    const nx = snap(Math.min(100, Math.max(0, drag.originX + dx)));
    const ny = snap(Math.min(100, Math.max(0, drag.originY + dy)));
    drag.lastX = nx;
    drag.lastY = ny;
    setLayers((prev) =>
      prev.map((l) =>
        l.id === drag.id ? { ...l, x: nx, y: ny } : l
      )
    );
  };

  const onPointerUp = () => {
    const drag = dragRef.current;
    if (drag) {
      const moved = drag.lastX !== drag.originX || drag.lastY !== drag.originY;
      if (moved) {
        setHistory((h) => [...h.slice(-24), drag.snapshot]);
        setFuture([]);
      }
    }
    dragRef.current = null;
    setShowGuides(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if (mod && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }
      if (!selectedId) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if ((e.target as HTMLElement).tagName === "INPUT") return;
        e.preventDefault();
        deleteSelected();
        return;
      }
      const nudge = e.shiftKey ? 2 : 0.8;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        if ((e.target as HTMLElement).tagName === "INPUT") return;
        e.preventDefault();
        updateLayers((prev) =>
          prev.map((l) => {
            if (l.id !== selectedId) return l;
            if (e.key === "ArrowUp") return { ...l, y: l.y - nudge };
            if (e.key === "ArrowDown") return { ...l, y: l.y + nudge };
            if (e.key === "ArrowLeft") return { ...l, x: l.x - nudge };
            return { ...l, x: l.x + nudge };
          })
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, undo, redo, deleteSelected, updateLayers]);

  return (
    <>
      <StatusLine message={status} onClear={() => setStatus(null)} />

      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 lg:gap-8 items-start">
        <div
          ref={canvasRef}
          className="relative rounded-[1.25rem] overflow-hidden border border-[var(--glass-line)] shadow-[0_24px_50px_-30px_rgba(36,31,26,0.45)] bg-[var(--cream)] touch-none select-none"
          onClick={() => setSelectedId(null)}
        >
          <Image
            src={template.src}
            alt={template.title}
            width={800}
            height={800}
            className="w-full h-auto pointer-events-none"
            priority
          />

          {showGuides && (
            <>
              <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[var(--accent)]/40" />
              <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[var(--accent)]/40" />
            </>
          )}

          {layers.map((layer) => {
            const active = layer.id === selectedId;
            const fontSize = `clamp(14px, ${layer.scale * 100}vw, ${layer.scale * 800}px)`;
            return (
              <div
                key={layer.id}
                onPointerDown={(e) =>
                  onPointerDown(e, layer.id, layer.x, layer.y)
                }
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onClick={(e) => e.stopPropagation()}
                className={clsx(
                  "absolute cursor-grab active:cursor-grabbing px-1",
                  active && "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-transparent rounded"
                )}
                style={{
                  left: `${layer.x}%`,
                  top: `${layer.y}%`,
                  transform: "translate(-50%, -50%)",
                  maxWidth: `${layer.maxWidth}%`,
                  textAlign: layer.align,
                }}
              >
                <span
                  style={{
                    fontFamily:
                      'Impact, Haettenschweiler, "Arial Black", sans-serif',
                    fontSize,
                    fontWeight: 900,
                    color: layer.color,
                    WebkitTextStroke: `${Math.max(1, layer.strokeWidth / 2)}px ${layer.strokeColor}`,
                    paintOrder: "stroke fill",
                    textTransform: layer.uppercase ? "uppercase" : "none",
                    lineHeight: 1.1,
                    wordBreak: "break-word",
                    display: "block",
                  }}
                >
                  {layer.uppercase ? layer.text.toUpperCase() : layer.text}
                </span>
              </div>
            );
          })}
        </div>

        <aside className="glass rounded-[1.25rem] p-4 sm:p-5 flex flex-col gap-5 lg:sticky lg:top-24">
          <div>
            <p className="text-xs text-[var(--ink-mute)]">Template</p>
            <p className="font-medium text-[var(--ink)] mt-0.5">{template.title}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => addLayer({ y: 12, text: "TOP TEXT" })}
              className="btn-quiet !text-xs"
            >
              + Top
            </button>
            <button
              type="button"
              onClick={() => addLayer({ y: 88, text: "BOTTOM TEXT" })}
              className="btn-quiet !text-xs"
            >
              + Bottom
            </button>
            <button
              type="button"
              onClick={() => addLayer()}
              className="btn-quiet !text-xs"
            >
              + Text
            </button>
          </div>

          {selected ? (
            <div className="flex flex-col gap-3 border-t border-[var(--glass-line)] pt-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-[var(--ink-mute)]">Text</span>
                <input
                  value={selected.text}
                  onChange={(e) => updateSelected({ text: e.target.value })}
                  className="w-full rounded-xl border border-[var(--glass-line)] bg-white/70 px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]/50"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-[var(--ink-mute)]">
                  Size · {Math.round(selected.scale * 100)}%
                </span>
                <input
                  type="range"
                  min={0.04}
                  max={0.14}
                  step={0.005}
                  value={selected.scale}
                  onChange={(e) =>
                    updateSelected({ scale: parseFloat(e.target.value) })
                  }
                  className="w-full accent-[var(--accent)]"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-[var(--ink-mute)]">Fill</span>
                  <input
                    type="color"
                    value={selected.color}
                    onChange={(e) => updateSelected({ color: e.target.value })}
                    className="h-10 w-full rounded-lg cursor-pointer border border-[var(--glass-line)]"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs text-[var(--ink-mute)]">Outline</span>
                  <input
                    type="color"
                    value={selected.strokeColor}
                    onChange={(e) =>
                      updateSelected({ strokeColor: e.target.value })
                    }
                    className="h-10 w-full rounded-lg cursor-pointer border border-[var(--glass-line)]"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={deleteSelected}
                className="btn-quiet !text-xs !text-[var(--accent)] self-start"
              >
                Remove layer
              </button>
            </div>
          ) : (
            <p className="text-sm text-[var(--ink-mute)] border-t border-[var(--glass-line)] pt-4">
              Tap a text layer to edit. Drag to move. Arrow keys nudge.
            </p>
          )}

          <div className="flex flex-col gap-2 border-t border-[var(--glass-line)] pt-4">
            <button
              type="button"
              onClick={copyMeme}
              disabled={exporting}
              className="btn-primary w-full justify-center"
            >
              {exporting ? "Rendering…" : "Copy image"}
            </button>
            <button
              type="button"
              onClick={downloadMeme}
              disabled={exporting}
              className="btn-quiet w-full justify-center"
            >
              Download PNG
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={undo}
                disabled={!history.length}
                className="btn-quiet flex-1 !text-xs"
              >
                Undo
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={!future.length}
                className="btn-quiet flex-1 !text-xs"
              >
                Redo
              </button>
            </div>
          </div>

          <p className="text-[11px] text-[var(--ink-mute)] leading-relaxed">
            Layers snap to center while dragging. On iOS/Android, copy may open
            the share sheet instead — that still gets the image into your apps.
          </p>
        </aside>
      </div>
    </>
  );
}

export function MemeMakerPageShell() {
  return (
    <div className="px-4 pt-4 sm:pt-8 pb-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 sm:mb-10 max-w-2xl">
          <p className="text-sm text-[var(--ink-mute)]">template · layers · export</p>
          <h1 className="text-display text-4xl sm:text-5xl font-semibold mt-3 text-[var(--ink)]">
            Meme maker
          </h1>
          <p className="mt-4 text-[var(--ink-soft)] leading-relaxed">
            The rabbit-lion template is loaded. Add text, drag it into place,
            then copy or download.{" "}
            <Link href="/memes" className="link-underline text-[var(--accent)]">
              Browse the depot
            </Link>{" "}
            when you are done.
          </p>
        </header>
        <MemeMaker />
      </div>
    </div>
  );
}
