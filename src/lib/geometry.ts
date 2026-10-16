import type { Point, Region } from "../types/editor";
export const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));
export function rectangle(a: Point, b: Point, width: number, height: number) {
  const x = Math.floor(clamp(Math.min(a.x, b.x), 0, width));
  const y = Math.floor(clamp(Math.min(a.y, b.y), 0, height));
  return {
    x,
    y,
    width: Math.ceil(clamp(Math.max(a.x, b.x), 0, width)) - x,
    height: Math.ceil(clamp(Math.max(a.y, b.y), 0, height)) - y,
  };
}
export function imagePoint(
  client: Point,
  bounds: { left: number; top: number; width: number; height: number },
  width: number,
  height: number,
): Point {
  return {
    x: clamp(((client.x - bounds.left) * width) / bounds.width, 0, width),
    y: clamp(((client.y - bounds.top) * height) / bounds.height, 0, height),
  };
}
export const contains = (r: Region, p: Point) =>
  p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height;
