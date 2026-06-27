export type CopyResult = "clipboard" | "share" | "failed";

async function blobToPng(blob: Blob): Promise<Blob> {
  const img = await blobToImage(blob);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(img, 0, 0);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Encode failed"))),
      "image/png"
    );
  });
}

function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

function mimeForBlob(blob: Blob): string {
  if (blob.type === "image/jpeg" || blob.type === "image/jpg") return "image/jpeg";
  if (blob.type === "image/png") return "image/png";
  if (blob.type === "image/webp") return "image/webp";
  return "image/png";
}

export async function fetchImageBlob(src: string): Promise<Blob> {
  const res = await fetch(src);
  if (!res.ok) throw new Error("Fetch failed");
  return res.blob();
}

export async function copyImageBlob(
  blob: Blob,
  filename = "rblm-meme.png"
): Promise<CopyResult> {
  const mime = mimeForBlob(blob);
  let clipboardBlob = blob;
  if (mime !== "image/png") {
    try {
      clipboardBlob = await blobToPng(blob);
    } catch {
      clipboardBlob = blob;
    }
  }

  try {
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      const type = clipboardBlob.type || "image/png";
      await navigator.clipboard.write([
        new ClipboardItem({ [type]: clipboardBlob }),
      ]);
      return "clipboard";
    }
  } catch {
    /* fall through — common on mobile */
  }

  try {
    if (navigator.share && navigator.canShare) {
      const shareMime = mimeForBlob(blob);
      const file = new File([blob], filename, { type: shareMime });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "RBLM meme" });
        return "share";
      }
    }
  } catch {
    /* user cancelled share sheet */
  }

  return "failed";
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function filenameFromSrc(src: string, slug: string) {
  const ext = src.split(".").pop()?.split("?")[0] || "png";
  return `rblm-${slug}.${ext}`;
}

export async function copyImageFromSrc(src: string, slug: string): Promise<CopyResult> {
  const blob = await fetchImageBlob(src);
  return copyImageBlob(blob, filenameFromSrc(src, slug));
}

export async function downloadImageFromSrc(src: string, slug: string) {
  const blob = await fetchImageBlob(src);
  downloadBlob(blob, filenameFromSrc(src, slug));
}
