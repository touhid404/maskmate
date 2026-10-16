export type StickerStyle = "smile" | "heart" | "star" | "lock";
export type Tool = "redact" | "blur" | "pixelate" | "sticker";
export interface Point {
  x: number;
  y: number;
}
export interface Region extends Point {
  id: string;
  width: number;
  height: number;
  tool: Tool;
  color: string;
  intensity: number;
  sticker?: StickerStyle;
}
export interface SourceImage {
  image: ImageBitmap;
  name: string;
  width: number;
  height: number;
  demo?: boolean;
}
export interface HistoryState {
  regions: Region[];
  past: Region[][];
  future: Region[][];
}
export type HistoryAction =
  | { type: "commit"; regions: Region[] }
  | { type: "undo" | "redo" | "clear" };
