import type { Region } from "../types/editor";

/** Opaque backing is mandatory: artwork alone must never leave source pixels exposed. */
export function drawSticker(ctx: CanvasRenderingContext2D, region: Region) {
  const { x, y, width, height } = region;
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = /^#[0-9a-f]{6}$/i.test(region.color)
    ? region.color
    : "#075b45";
  const left = Math.floor(x),
    top = Math.floor(y),
    right = Math.ceil(x + width),
    bottom = Math.ceil(y + height);
  ctx.fillRect(left, top, right - left, bottom - top);
  ctx.beginPath();
  ctx.rect(left, top, right - left, bottom - top);
  ctx.clip();
  ctx.translate(x + width / 2, y + height / 2);
  const scale = Math.min(width, height) * 0.008;
  ctx.scale(scale, scale);
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const style = region.sticker ?? "smile";
  if (style === "smile") {
    ctx.fillStyle = "#ffda65";
    ctx.beginPath();
    ctx.arc(0, 0, 43, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#392d1c";
    for (const eye of [-14, 14]) {
      ctx.beginPath();
      ctx.ellipse(eye, -9, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "#392d1c";
    ctx.beginPath();
    ctx.arc(0, 2, 23, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  } else if (style === "heart") {
    ctx.fillStyle = "#fa91a5";
    ctx.beginPath();
    ctx.moveTo(0, 39);
    ctx.bezierCurveTo(-70, -4, -39, -58, 0, -24);
    ctx.bezierCurveTo(39, -58, 70, -4, 0, 39);
    ctx.fill();
    ctx.strokeStyle = "#ffc4d0";
    ctx.beginPath();
    ctx.moveTo(-28, -15);
    ctx.quadraticCurveTo(-24, -30, -12, -25);
    ctx.stroke();
  } else if (style === "star") {
    ctx.fillStyle = "#ffe17d";
    ctx.strokeStyle = "#edb348";
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2,
        radius = i % 2 ? 21 : 46;
      const px = Math.cos(angle) * radius,
        py = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.strokeStyle = "#bce7c9";
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.arc(0, -13, 23, Math.PI, 0);
    ctx.lineTo(23, 10);
    ctx.stroke();
    ctx.fillStyle = "#bce7c9";
    ctx.beginPath();
    ctx.roundRect(-34, -8, 68, 53, 8);
    ctx.fill();
    ctx.fillStyle = "#285a42";
    ctx.beginPath();
    ctx.arc(0, 12, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-3, 12, 6, 14);
  }
  ctx.restore();
}
