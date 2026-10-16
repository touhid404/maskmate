import { headerDimensions } from "../src/lib/imageHeader";
import { describe, it, expect } from "vitest";
import { rectangle, imagePoint, contains } from "../src/lib/geometry";
import { historyReducer, initialHistory } from "../src/hooks/useHistory";
import { validateFile, validateDimensions } from "../src/lib/upload";
import type { Region } from "../src/types/editor";
const r: Region = {
  id: "a",
  x: 10,
  y: 20,
  width: 80,
  height: 30,
  tool: "redact",
  color: "#000000",
  intensity: 16,
};
describe("original-pixel geometry", () => {
  it.each([
    [10, 20, 70, 80],
    [70, 80, 10, 20],
    [70, 20, 10, 80],
    [10, 80, 70, 20],
  ])("normalizes drag direction", (ax, ay, bx, by) => {
    expect(rectangle({ x: ax, y: ay }, { x: bx, y: by }, 100, 100)).toEqual({
      x: 10,
      y: 20,
      width: 60,
      height: 60,
    });
  });
  it("clamps all four image boundaries", () =>
    expect(rectangle({ x: -20, y: 500 }, { x: 300, y: -50 }, 192, 108)).toEqual(
      { x: 0, y: 0, width: 192, height: 108 },
    ));
  it("covers fractional pixels outward", () =>
    expect(rectangle({ x: 1.8, y: 2.2 }, { x: 8.1, y: 9.4 }, 100, 100)).toEqual(
      { x: 1, y: 2, width: 8, height: 8 },
    ));
  it("maps downscaled screenshots to source pixels", () =>
    expect(
      imagePoint(
        { x: 110, y: 70 },
        { left: 10, top: 20, width: 960, height: 540 },
        1920,
        1080,
      ),
    ).toEqual({ x: 200, y: 100 }));
  it("maps at different zoom factors", () =>
    expect(
      imagePoint(
        { x: 210, y: 120 },
        { left: 10, top: 20, width: 1920, height: 1080 },
        1920,
        1080,
      ),
    ).toEqual({ x: 200, y: 100 }));
  it("clamps pointer positions outside the displayed canvas", () =>
    expect(
      imagePoint(
        { x: -50, y: 400 },
        { left: 10, top: 20, width: 100, height: 100 },
        200,
        200,
      ),
    ).toEqual({ x: 0, y: 200 }));
  it("hit tests regions inclusively", () => {
    expect(contains(r, { x: 90, y: 50 })).toBe(true);
    expect(contains(r, { x: 91, y: 50 })).toBe(false);
  });
  it("does not turn a click into a visible rectangle", () =>
    expect(rectangle({ x: 20, y: 30 }, { x: 20, y: 30 }, 100, 100).width).toBe(
      0,
    ));
});
describe("immutable edit history", () => {
  it("restores effect settings and coordinates across alternating undo and redo", () => {
    let s = historyReducer(initialHistory, { type: "commit", regions: [r] });
    const changed = {
      ...r,
      x: 35,
      color: "#ffffff",
      tool: "pixelate" as const,
      intensity: 32,
    };
    s = historyReducer(s, { type: "commit", regions: [changed] });
    s = historyReducer(s, { type: "undo" });
    expect(s.regions).toEqual([r]);
    s = historyReducer(s, { type: "redo" });
    expect(s.regions).toEqual([changed]);
    s = historyReducer(s, { type: "undo" });
    s = historyReducer(s, { type: "undo" });
    expect(s.regions).toEqual([]);
    s = historyReducer(s, { type: "redo" });
    expect(s.regions).toEqual([r]);
    expect(r.x).toBe(10);
  });
  it("clears redo when a new operation is committed", () => {
    let s = historyReducer(initialHistory, { type: "commit", regions: [r] });
    s = historyReducer(s, { type: "undo" });
    s = historyReducer(s, { type: "commit", regions: [{ ...r, id: "b" }] });
    expect(s.future).toEqual([]);
  });
  it("can undo deletion and reset", () => {
    let s = historyReducer(initialHistory, { type: "commit", regions: [r] });
    s = historyReducer(s, { type: "commit", regions: [] });
    expect(historyReducer(s, { type: "undo" }).regions).toEqual([r]);
  });
  it("does not change history when no undo or redo exists", () => {
    expect(historyReducer(initialHistory, { type: "undo" })).toBe(
      initialHistory,
    );
    expect(historyReducer(initialHistory, { type: "redo" })).toBe(
      initialHistory,
    );
  });
  it("bounds snapshots to 50 operations", () => {
    let s = initialHistory;
    for (let i = 0; i < 80; i++)
      s = historyReducer(s, { type: "commit", regions: [{ ...r, x: i }] });
    expect(s.past).toHaveLength(50);
  });
});
describe("input memory limits", () => {
  it.each(["image/png", "image/jpeg", "image/webp"])(
    "accepts supported formats: %s",
    (type) => expect(() => validateFile({ type, size: 2048 })).not.toThrow(),
  );
  it.each(["image/svg+xml", "image/gif", "text/plain"])(
    "rejects unsupported formats: %s",
    (type) => expect(() => validateFile({ type, size: 2048 })).toThrow("PNG"),
  );
  it("rejects empty and oversized files", () => {
    expect(() => validateFile({ type: "image/png", size: 0 })).toThrow("empty");
    expect(() =>
      validateFile({ type: "image/png", size: 20 * 1024 * 1024 + 1 }),
    ).toThrow("20 MB");
  });
  it("accepts original HD dimensions and very small images", () => {
    expect(() => validateDimensions(1920, 1080)).not.toThrow();
    expect(() => validateDimensions(1, 1)).not.toThrow();
  });
  it("rejects oversized or zero decoded dimensions", () => {
    expect(() => validateDimensions(6000, 5000)).toThrow();
    expect(() => validateDimensions(17000, 1)).toThrow();
    expect(() => validateDimensions(0, 40)).toThrow();
  });
});

describe("pre-decode image headers", () => {
  it("reads PNG dimensions without decoding image bytes", () => {
    const b = new Uint8Array(24),
      v = new DataView(b.buffer);
    v.setUint32(0, 0x89504e47);
    v.setUint32(4, 0x0d0a1a0a);
    v.setUint32(16, 1920);
    v.setUint32(20, 1080);
    expect(headerDimensions(b)).toEqual({ width: 1920, height: 1080 });
  });
  it("reads JPEG SOF dimensions", () => {
    const b = new Uint8Array([
      255, 216, 255, 192, 0, 17, 8, 4, 56, 7, 128, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    expect(headerDimensions(b)).toEqual({ width: 1920, height: 1080 });
  });
  it("ignores truncated and unrecognized headers safely", () => {
    expect(headerDimensions(new Uint8Array([255, 216, 255]))).toBe(null);
    expect(headerDimensions(new Uint8Array(0))).toBe(null);
  });
});
