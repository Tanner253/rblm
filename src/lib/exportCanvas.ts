export type TextLayer = {
  id: string;
  text: string;
  /** Horizontal position as percentage of canvas width. */
  x: number;
  /** Vertical position as percentage of canvas height. */
  y: number;
  /** Font size relative to canvas width (e.g. 0.08 = 8% of width). */
  scale: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  align: "left" | "center" | "right";
  uppercase: boolean;
  maxWidth: number;
};

export function createTextLayer(partial?: Partial<TextLayer>): TextLayer {
  return {
    id: crypto.randomUUID(),
    text: "YOUR TEXT",
    x: 50,
    y: 10,
    scale: 0.09,
    color: "#ffffff",
    strokeColor: "#000000",
    strokeWidth: 4,
    align: "center",
    uppercase: true,
    maxWidth: 90,
    ...partial,
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [text];
}

function drawTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  width: number,
  height: number
) {
  const fontSize = Math.round(width * layer.scale);
  const font = `900 ${fontSize}px Impact, Haettenschweiler, "Arial Black", sans-serif`;
  ctx.font = font;
  ctx.textBaseline = "top";

  const raw = layer.uppercase ? layer.text.toUpperCase() : layer.text;
  const maxPx = (width * layer.maxWidth) / 100;
  const lines = wrapLines(ctx, raw, maxPx);
  const lineHeight = fontSize * 1.12;
  const blockHeight = lines.length * lineHeight;
  const anchorX = (width * layer.x) / 100;
  const anchorY = (height * layer.y) / 100 - blockHeight / 2;

  lines.forEach((line, i) => {
    const y = anchorY + i * lineHeight;
    let x = anchorX;
    if (layer.align === "left") {
      ctx.textAlign = "left";
      x = anchorX - maxPx / 2;
    } else if (layer.align === "right") {
      ctx.textAlign = "right";
      x = anchorX + maxPx / 2;
    } else {
      ctx.textAlign = "center";
    }

    ctx.lineJoin = "round";
    ctx.miterLimit = 2;
    ctx.lineWidth = layer.strokeWidth;
    ctx.strokeStyle = layer.strokeColor;
    ctx.fillStyle = layer.color;
    ctx.strokeText(line, x, y);
    ctx.fillText(line, x, y);
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
