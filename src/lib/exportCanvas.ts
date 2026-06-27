export const MEME_LETTER_SPACING_EM = 0.065;

export type TextLayer = {
  id: "top" | "bottom";
  text: string;
  placeholder: string;
  x: number;
  y: number;
  scale: number;
  maxWidth: number;
};

export const DEFAULT_LAYERS: TextLayer[] = [
  {
    id: "top",
    text: "",
    placeholder: "ME ON THE INTERNET",
    x: 24,
    y: 13,
    scale: 0.072,
    maxWidth: 42,
  },
  {
    id: "bottom",
    text: "",
    placeholder: "ME IN REAL LIFE",
    x: 76,
    y: 78,
    scale: 0.062,
    maxWidth: 28,
  },
];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function measureSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  letterSpacing: number
) {
  if (!text) return 0;
  return [...text].reduce(
    (w, char, i, arr) =>
      w + ctx.measureText(char).width + (i < arr.length - 1 ? letterSpacing : 0),
    0
  );
}

function breakLongWord(
  ctx: CanvasRenderingContext2D,
  word: string,
  maxWidth: number,
  letterSpacing: number
): string[] {
  const parts: string[] = [];
  let current = "";
  for (const char of [...word]) {
    const test = current + char;
    if (measureSpacedText(ctx, test, letterSpacing) > maxWidth && current) {
      parts.push(current);
      current = char;
    } else {
      current = test;
    }
  }
  if (current) parts.push(current);
  return parts.length ? parts : [word];
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  letterSpacing: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [text];

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const segments =
      measureSpacedText(ctx, word, letterSpacing) > maxWidth
        ? breakLongWord(ctx, word, maxWidth, letterSpacing)
        : [word];

    for (const segment of segments) {
      const test = current ? `${current} ${segment}` : segment;
      if (measureSpacedText(ctx, test, letterSpacing) > maxWidth && current) {
        lines.push(current);
        current = segment;
      } else {
        current = test;
      }
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [text];
}

const MIN_FONT_SCALE = 0.2;
const CANVAS_TEXT_PADDING_PX = 6;

let measureCtx: CanvasRenderingContext2D | null = null;

function getMeasureCtx(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!measureCtx) {
    const canvas = document.createElement("canvas");
    measureCtx = canvas.getContext("2d");
  }
  return measureCtx;
}

export type TextLayerLayout = {
  fontSize: number;
  lines: string[];
  lineHeight: number;
};

export function computeTextLayerLayout(
  layer: TextLayer,
  content: string,
  width: number,
  height: number
): TextLayerLayout {
  const text = (content.trim() || layer.placeholder).toUpperCase();
  const maxPx = (width * layer.maxWidth) / 100;
  const baseFontSize = width * layer.scale;
  const minFontSize = Math.max(10, baseFontSize * MIN_FONT_SCALE);
  const ctx = getMeasureCtx();

  const layoutAt = (fontSize: number): TextLayerLayout | null => {
    const letterSpacing = fontSize * MEME_LETTER_SPACING_EM;
    if (ctx) {
      ctx.font = `900 ${fontSize}px Impact, Haettenschweiler, "Arial Black", sans-serif`;
    }
    const lines = ctx ? wrapLines(ctx, text, maxPx, letterSpacing) : [text];
    const lineHeight = fontSize * 1.08;
    const blockHeight = lines.length * lineHeight;
    const anchorY = (height * layer.y) / 100;
    const top = anchorY - blockHeight / 2;
    const bottom = anchorY + blockHeight / 2;
    if (top < CANVAS_TEXT_PADDING_PX || bottom > height - CANVAS_TEXT_PADDING_PX) {
      return null;
    }
    return { fontSize, lines, lineHeight };
  };

  const baseLayout = layoutAt(baseFontSize);
  if (baseLayout) return baseLayout;

  let lo = minFontSize;
  let hi = baseFontSize;
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    if (layoutAt(mid)) lo = mid;
    else hi = mid;
  }

  const fitted = layoutAt(lo);
  if (fitted) return fitted;

  const letterSpacing = minFontSize * MEME_LETTER_SPACING_EM;
  if (ctx) {
    ctx.font = `900 ${minFontSize}px Impact, Haettenschweiler, "Arial Black", sans-serif`;
  }
  return {
    fontSize: minFontSize,
    lines: ctx ? wrapLines(ctx, text, maxPx, letterSpacing) : [text],
    lineHeight: minFontSize * 1.08,
  };
}

function drawSpacedLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  letterSpacing: number
) {
  const chars = [...text];
  const total = measureSpacedText(ctx, text, letterSpacing);
  let x = centerX - total / 2;
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    ctx.strokeText(char, x, y);
    ctx.fillText(char, x, y);
    x += ctx.measureText(char).width + (i < chars.length - 1 ? letterSpacing : 0);
  }
}

function drawTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  width: number,
  height: number
) {
  const content = layer.text.trim() || layer.placeholder;
  const { fontSize, lines, lineHeight } = computeTextLayerLayout(
    layer,
    content,
    width,
    height
  );
  const letterSpacing = fontSize * MEME_LETTER_SPACING_EM;
  ctx.font = `900 ${fontSize}px Impact, Haettenschweiler, "Arial Black", sans-serif`;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  const blockHeight = lines.length * lineHeight;
  const anchorX = (width * layer.x) / 100;
  const anchorY = (height * layer.y) / 100 - blockHeight / 2;

  lines.forEach((line, i) => {
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#ffffff";
    drawSpacedLine(ctx, line, anchorX, anchorY + i * lineHeight, letterSpacing);
  });
}

export async function renderMemeToBlob(
  imageSrc: string,
  layers: TextLayer[]
): Promise<Blob> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.drawImage(img, 0, 0);
  for (const layer of layers) {
    drawTextLayer(ctx, layer, canvas.width, canvas.height);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Export failed"))),
      "image/png"
    );
  });
}

export function layerDisplayText(layer: TextLayer) {
  return layer.text.trim() || layer.placeholder;
}

export function layerIsEmpty(layer: TextLayer) {
  return !layer.text.trim();
}
