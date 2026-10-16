import { drawSticker } from "./stickers";
import type { Region, SourceImage } from "../types/editor";
export function canvas2d(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Your browser could not create an image canvas.");
  return { canvas, ctx };
}
// Three separable box passes approximate Gaussian blur on browsers without Canvas filters.
function fallbackBlur(ctx: CanvasRenderingContext2D, radius: number) {
  const w = ctx.canvas.width,
    h = ctx.canvas.height;
  const data = ctx.getImageData(0, 0, w, h),
    pixels = data.data;
  const temp = new Uint8ClampedArray(pixels.length),
    r = Math.max(1, Math.round(radius)),
    div = 2 * r + 1;
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < h; y++)
      for (let c = 0; c < 4; c++) {
        let sum = 0;
        for (let k = -r; k <= r; k++)
          sum += pixels[(y * w + Math.min(w - 1, Math.max(0, k))) * 4 + c];
        for (let x = 0; x < w; x++) {
          temp[(y * w + x) * 4 + c] = sum / div;
          sum +=
            pixels[(y * w + Math.min(w - 1, x + r + 1)) * 4 + c] -
            pixels[(y * w + Math.max(0, x - r)) * 4 + c];
        }
      }
    for (let x = 0; x < w; x++)
      for (let c = 0; c < 4; c++) {
        let sum = 0;
        for (let k = -r; k <= r; k++)
          sum += temp[(Math.min(h - 1, Math.max(0, k)) * w + x) * 4 + c];
        for (let y = 0; y < h; y++) {
          pixels[(y * w + x) * 4 + c] = sum / div;
          sum +=
            temp[(Math.min(h - 1, y + r + 1) * w + x) * 4 + c] -
            temp[(Math.max(0, y - r) * w + x) * 4 + c];
        }
      }
  }
  ctx.putImageData(data, 0, 0);
}
export function renderEditedImage(
  canvas: HTMLCanvasElement,
  source: SourceImage,
  regions: Region[],
) {
  if (canvas.width !== source.width) canvas.width = source.width;
  if (canvas.height !== source.height) canvas.height = source.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image rendering is unavailable.");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source.image, 0, 0);
  for (const r of regions.filter(
    (r) => r.tool === "blur" || r.tool === "pixelate",
  )) {
    if (r.width < 1 || r.height < 1) continue;
    ctx.save();
    ctx.beginPath();
    ctx.rect(r.x, r.y, r.width, r.height);
    ctx.clip();
    if (r.tool === "pixelate") {
      const { canvas: tiny, ctx: t } = canvas2d(
        Math.max(1, Math.ceil(r.width / r.intensity)),
        Math.max(1, Math.ceil(r.height / r.intensity)),
      );
      t.drawImage(
        source.image,
        r.x,
        r.y,
        r.width,
        r.height,
        0,
        0,
        tiny.width,
        tiny.height,
      );
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tiny, r.x, r.y, r.width, r.height);
      tiny.width = tiny.height = 0;
    } else {
      const pad = Math.ceil(r.intensity * 3),
        x = Math.max(0, r.x - pad),
        y = Math.max(0, r.y - pad);
      const w = Math.min(source.width - x, r.width + pad * 2),
        h = Math.min(source.height - y, r.height + pad * 2);
      const { canvas: crop, ctx: t } = canvas2d(w, h);
      t.drawImage(source.image, x, y, w, h, 0, 0, w, h);
      if (Reflect.has(ctx, "filter")) {
        ctx.filter = `blur(${r.intensity}px)`;
        ctx.drawImage(crop, x, y);
      } else {
        fallbackBlur(t, r.intensity);
        ctx.drawImage(crop, x, y);
      }
      crop.width = crop.height = 0;
    }
    ctx.restore();
  }
  for (const r of regions.filter((r) => r.tool === "sticker")) {
    if (r.width >= 1 && r.height >= 1) drawSticker(ctx, r);
  }
  // Security invariant: solid regions are always the final, fully opaque pass.
  for (const r of regions.filter((r) => r.tool === "redact")) {
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = /^#[0-9a-f]{6}$/i.test(r.color) ? r.color : "#000000";
    ctx.fillRect(
      Math.floor(r.x),
      Math.floor(r.y),
      Math.ceil(r.x + r.width) - Math.floor(r.x),
      Math.ceil(r.y + r.height) - Math.floor(r.y),
    );
    ctx.restore();
  }
}
export async function exportImage(source: SourceImage, regions: Region[]) {
  const { canvas } = canvas2d(source.width, source.height);
  try {
    renderEditedImage(canvas, source, regions);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) =>
          b
            ? resolve(b)
            : reject(new Error("Could not create PNG. Try a smaller image.")),
        "image/png",
      ),
    );
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `${source.name.replace(/\.[^.]+$/, "")}-masked.png`;
    document.body.append(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 10000);
  } finally {
    canvas.width = canvas.height = 0;
  }
}
