import { canvas2d, renderEditedImage } from "../src/lib/imageProcessing";
import { decodeFile } from "../src/lib/upload";
import type { Region, SourceImage } from "../src/types/editor";
const results = document.getElementById("results")!,
  status = document.getElementById("status")!;
let failures = 0,
  passed = 0;
function assert(ok: unknown, message: string) {
  if (!ok) throw new Error(message);
}
async function test(name: string, fn: () => unknown | Promise<unknown>) {
  const li = document.createElement("li");
  try {
    await fn();
    li.textContent = "PASS — " + name;
    passed++;
  } catch (e) {
    failures++;
    li.className = "fail";
    li.textContent =
      "FAIL — " + name + ": " + (e instanceof Error ? e.message : String(e));
  }
  results.append(li);
}
function blob(canvas: HTMLCanvasElement, type = "image/png") {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Empty blob"))),
      type,
    ),
  );
}
function pixel(canvas: HTMLCanvasElement, x: number, y: number) {
  return Array.from(canvas.getContext("2d")!.getImageData(x, y, 1, 1).data);
}
const original = canvas2d(1920, 1080);
original.ctx.fillStyle = "#ff0000";
original.ctx.fillRect(0, 0, 1920, 1080);
original.ctx.fillStyle = "#ffffff";
original.ctx.fillRect(200, 100, 800, 500);
original.ctx.fillStyle = "#0000ff";
for (let i = 0; i < 80; i++) original.ctx.fillRect(200 + i * 10, 100, 5, 500);
const source: SourceImage = {
  image: await createImageBitmap(original.canvas),
  name: "pixel-test.png",
  width: 1920,
  height: 1080,
};
const base: Region = {
  id: "solid",
  x: 220,
  y: 120,
  width: 400,
  height: 180,
  tool: "redact",
  color: "#000000",
  intensity: 16,
};
const rendered = canvas2d(1920, 1080).canvas;
await test("PNG, JPEG, WebP decode at original 1920 × 1080 dimensions", async () => {
  for (const mime of ["image/png", "image/jpeg", "image/webp"]) {
    const b = await blob(original.canvas, mime);
    const decoded = await decodeFile(new File([b], "fixture", { type: mime }));
    assert(
      decoded.width === 1920 && decoded.height === 1080,
      "wrong dimensions",
    );
    decoded.image.close();
  }
});
await test("Corrupt image shows a friendly error", async () => {
  let rejected = false;
  try {
    await decodeFile(
      new File(["not an image"], "bad.png", { type: "image/png" }),
    );
  } catch (e) {
    rejected = e instanceof Error && e.message.includes("could not read");
  }
  assert(rejected, "corrupt image accepted");
});
await test("Solid redaction overwrites every covered pixel with opaque black", () => {
  renderEditedImage(rendered, source, [base]);
  const d = rendered
    .getContext("2d")!
    .getImageData(base.x, base.y, base.width, base.height).data;
  for (let i = 0; i < d.length; i += 4)
    assert(
      d[i] === 0 && d[i + 1] === 0 && d[i + 2] === 0 && d[i + 3] === 255,
      "nonopaque or uncovered pixel",
    );
});
await test("Overlapping blur and pixelation cannot expose a solid redaction", () => {
  renderEditedImage(rendered, source, [
    base,
    {
      ...base,
      id: "blur",
      tool: "blur",
      x: 200,
      y: 100,
      width: 650,
      height: 300,
    },
    { ...base, id: "pixelate", tool: "pixelate", width: 500, height: 250 },
  ]);
  assert(
    JSON.stringify(pixel(rendered, 300, 200)) === "[0,0,0,255]",
    "redaction exposed",
  );
});
await test("White and custom solid colors are fully opaque", () => {
  for (const color of ["#ffffff", "#075b45"]) {
    renderEditedImage(rendered, source, [{ ...base, color }]);
    const p = pixel(rendered, 300, 200);
    assert(p[3] === 255, "alpha");
    assert(
      p
        .slice(0, 3)
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("") === color.slice(1),
      "color mismatch",
    );
  }
});
await test("Invalid alpha-bearing color falls back to opaque black", () => {
  renderEditedImage(rendered, source, [{ ...base, color: "#00000000" }]);
  assert(
    JSON.stringify(pixel(rendered, 300, 200)) === "[0,0,0,255]",
    "unsafe fill",
  );
});
await test("Blur changes pixels and pixelation creates a distinct mosaic", () => {
  renderEditedImage(rendered, source, [{ ...base, tool: "blur" }]);
  const blur = pixel(rendered, 302, 200);
  assert(blur[0] > 0 && blur[2] > 0, "no blur");
  renderEditedImage(rendered, source, [
    { ...base, tool: "pixelate", intensity: 32 },
  ]);
  const mosaic = pixel(rendered, 302, 200);
  assert(JSON.stringify(mosaic) !== JSON.stringify(blur), "effects identical");
});
await test("Portable blur fallback works without native canvas filters", () => {
  const proto = CanvasRenderingContext2D.prototype;
  const desc = Object.getOwnPropertyDescriptor(proto, "filter");
  try {
    if (desc?.configurable)
      delete (proto as unknown as Record<string, unknown>).filter;
    renderEditedImage(rendered, source, [{ ...base, tool: "blur" }]);
    const p = pixel(rendered, 302, 200);
    assert(p[0] > 0 && p[2] > 0, "fallback did not blur");
  } finally {
    if (desc) Object.defineProperty(proto, "filter", desc);
  }
});
await test("Removing a region restores source pixels", () => {
  renderEditedImage(rendered, source, []);
  assert(
    JSON.stringify(pixel(rendered, 302, 200)) ===
      JSON.stringify(pixel(original.canvas, 302, 200)),
    "original not restored",
  );
});
await test("Original decoded source remains unchanged", () => {
  const probe = canvas2d(1920, 1080);
  probe.ctx.drawImage(source.image, 0, 0);
  assert(
    JSON.stringify(pixel(probe.canvas, 302, 200)) ===
      JSON.stringify(pixel(original.canvas, 302, 200)),
    "source mutated",
  );
  probe.canvas.width = 0;
});
await test("Exported PNG reopens independently, with correct dimensions and opaque pixels", async () => {
  renderEditedImage(rendered, source, [base]);
  const b = await blob(rendered);
  const decoded = await createImageBitmap(b);
  assert(decoded.width === 1920 && decoded.height === 1080, "resolution");
  const probe = canvas2d(1920, 1080);
  probe.ctx.drawImage(decoded, 0, 0);
  assert(
    JSON.stringify(pixel(probe.canvas, 300, 200)) === "[0,0,0,255]",
    "export pixels",
  );
  assert(
    JSON.stringify(pixel(probe.canvas, 50, 50)) === "[255,0,0,255]",
    "unexpected UI or blank export",
  );
  decoded.close();
  probe.canvas.width = 0;
});
await test("Re-encoding does not copy an injected EXIF GPS-bearing chunk", async () => {
  const input = new Uint8Array(
    await (await blob(original.canvas)).arrayBuffer(),
  );
  const payload = new TextEncoder().encode(
    "Exif\0\0GPSLatitude=23.8103;GPSLongitude=90.4125",
  );
  function crc32(data: Uint8Array) {
    let c = 0xffffffff;
    for (const b of data) {
      c ^= b;
      for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
    return (c ^ 0xffffffff) >>> 0;
  }
  const chunk = new Uint8Array(payload.length + 12),
    dv = new DataView(chunk.buffer);
  dv.setUint32(0, payload.length);
  chunk.set(new TextEncoder().encode("eXIf"), 4);
  chunk.set(payload, 8);
  dv.setUint32(chunk.length - 4, crc32(chunk.slice(4, -4)));
  const marked = new Uint8Array(input.length + chunk.length);
  marked.set(input.slice(0, 33));
  marked.set(chunk, 33);
  marked.set(input.slice(33), 33 + chunk.length);
  const decoded = await decodeFile(
    new File([marked], "metadata.png", { type: "image/png" }),
  );
  renderEditedImage(rendered, decoded, [base]);
  const output = new Uint8Array(await (await blob(rendered)).arrayBuffer());
  const text = new TextDecoder().decode(output);
  assert(
    !text.includes("GPSLatitude") &&
      !text.includes("GPSLongitude") &&
      !text.includes("eXIf"),
    "source metadata copied",
  );
  decoded.image.close();
});
source.image.close();
original.canvas.width = 0;
rendered.width = 0;
status.textContent = `${passed} passed · ${failures} failed`;
document.title = failures ? "FAIL — MaskMate checks" : "PASS — MaskMate checks";
