import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type {
  Point,
  Region,
  SourceImage,
  Tool,
  StickerStyle,
} from "../types/editor";
import { clamp, contains, imagePoint, rectangle } from "../lib/geometry";
import { toast } from "sonner";
import { renderEditedImage } from "../lib/imageProcessing";
interface Props {
  source: SourceImage;
  regions: Region[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  tool: Tool | "select";
  color: string;
  intensity: number;
  sticker: StickerStyle;
  zoom: number;
  compare: boolean;
  commit: (regions: Region[]) => void;
}
interface Gesture {
  start: Point;
  region: Region;
  mode: "draw" | "move" | "nw" | "ne" | "sw" | "se";
}
export function EditorCanvas({
  source,
  regions,
  selected,
  onSelect,
  tool,
  color,
  intensity,
  sticker,
  zoom,
  compare,
  commit,
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null),
    viewport = useRef<HTMLDivElement>(null),
    stage = useRef<HTMLDivElement>(null),
    gesture = useRef<Gesture | null>(null);
  const [draft, setDraft] = useState<Region | null>(null),
    [size, setSize] = useState({ w: 800, h: 600 });
  useLayoutEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const b = entries[0].contentRect;
      setSize({ w: b.width, h: b.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    try {
      if (canvas.current)
        renderEditedImage(canvas.current, source, compare ? [] : regions);
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Could not render this image. Try a smaller screenshot.",
      );
    }
  }, [source, regions, compare]);
  useEffect(() => {
    const cancel = () => {
      gesture.current = null;
      setDraft(null);
    };
    window.addEventListener("maskmate:cancel", cancel);
    return () => window.removeEventListener("maskmate:cancel", cancel);
  }, []);
  const scale =
    Math.min((size.w - 48) / source.width, (size.h - 64) / source.height, 1) *
    zoom;
  const point = (e: PointerEvent) =>
    imagePoint(
      { x: e.clientX, y: e.clientY },
      stage.current!.getBoundingClientRect(),
      source.width,
      source.height,
    );
  function down(e: PointerEvent) {
    if (compare || e.button !== 0) return;
    const p = point(e);
    e.currentTarget.setPointerCapture(e.pointerId);
    const handle = (e.target as HTMLElement).dataset?.handle as
      | Gesture["mode"]
      | undefined;
    const hit = handle
      ? regions.find((r) => r.id === selected)
      : tool === "select"
        ? [...regions].reverse().find((r) => contains(r, p))
        : undefined;
    if (hit) {
      onSelect(hit.id);
      gesture.current = { start: p, region: hit, mode: handle ?? "move" };
      setDraft(hit);
    } else if (tool !== "select") {
      const r: Region = {
        id: crypto.randomUUID(),
        x: p.x,
        y: p.y,
        width: 0,
        height: 0,
        tool,
        color,
        intensity,
        sticker,
      };
      gesture.current = { start: p, region: r, mode: "draw" };
      setDraft(r);
      onSelect(r.id);
    } else onSelect(null);
  }
  function move(e: PointerEvent) {
    const g = gesture.current;
    if (!g) return;
    const p = point(e),
      r = g.region;
    if (g.mode === "draw")
      setDraft({ ...r, ...rectangle(g.start, p, source.width, source.height) });
    else if (g.mode === "move")
      setDraft({
        ...r,
        x: Math.round(clamp(r.x + p.x - g.start.x, 0, source.width - r.width)),
        y: Math.round(
          clamp(r.y + p.y - g.start.y, 0, source.height - r.height),
        ),
      });
    else {
      const anchor = {
        x: g.mode.includes("w") ? r.x + r.width : r.x,
        y: g.mode.includes("n") ? r.y + r.height : r.y,
      };
      setDraft({ ...r, ...rectangle(anchor, p, source.width, source.height) });
    }
  }
  function up(e: PointerEvent) {
    if (!gesture.current) return;
    const mode = gesture.current.mode;
    gesture.current = null;
    if (draft && draft.width >= 2 && draft.height >= 2) {
      commit(
        mode === "draw"
          ? [...regions, draft]
          : regions.map((r) => (r.id === draft.id ? draft : r)),
      );
    } else if (mode === "draw") onSelect(null);
    setDraft(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  }
  const outlines = draft
    ? [...regions.filter((r) => r.id !== draft.id), draft]
    : regions;
  return (
    <div ref={viewport} className="canvas-viewport">
      <div className="canvas-scroll">
        <div
          className="canvas-stage"
          ref={stage}
          style={{
            width: Math.max(1, source.width * scale),
            height: Math.max(1, source.height * scale),
            cursor: compare
              ? "default"
              : tool === "select"
                ? "default"
                : "crosshair",
          }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={() => {
            gesture.current = null;
            setDraft(null);
          }}
        >
          <canvas
            ref={canvas}
            aria-label="Screenshot editing canvas. Choose a tool and drag to cover an area."
          />
          {!compare && (
            <div className="selection-layer">
              {outlines.map((r) => (
                <div
                  key={r.id}
                  className={`region-outline ${r.id === selected ? "selected" : ""} ${r.id === draft?.id ? "draft" : ""}`}
                  style={{
                    left: `${(r.x / source.width) * 100}%`,
                    top: `${(r.y / source.height) * 100}%`,
                    width: `${(r.width / source.width) * 100}%`,
                    height: `${(r.height / source.height) * 100}%`,
                    background:
                      r.id === draft?.id && r.tool === "redact"
                        ? r.color
                        : undefined,
                  }}
                >
                  {r.id === selected &&
                    ["nw", "ne", "sw", "se"].map((h) => (
                      <span
                        key={h}
                        data-handle={h}
                        className={`resize-handle ${h}`}
                        style={{ pointerEvents: "auto" }}
                      />
                    ))}
                </div>
              ))}
            </div>
          )}
          {compare && <span className="original-label">Original image</span>}
        </div>
      </div>
      <span className="canvas-hint">
        {compare
          ? "Original preview · edits are preserved"
          : tool === "select"
            ? "Select a region to move it. Drag its corners to resize."
            : "Drag over any information you want to cover."}
      </span>
    </div>
  );
}
