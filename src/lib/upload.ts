import { headerDimensions } from "./imageHeader";
import type { SourceImage } from "../types/editor";
export const MAX_SIZE = 20 * 1024 * 1024;
export function validateFile(file: Pick<File, "type" | "size">) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
    throw new Error("Choose a PNG, JPG, or WebP image.");
  if (file.size > MAX_SIZE)
    throw new Error("This image is too large. Choose a file under 20 MB.");
  if (!file.size)
    throw new Error("This file is empty. Please choose another image.");
}
export function validateDimensions(width: number, height: number) {
  if (
    width < 1 ||
    height < 1 ||
    width > 16384 ||
    height > 16384 ||
    width * height > 24000000
  )
    throw new Error(
      "This image is too large to edit safely. Use an image under 24 megapixels and 16,384 pixels per side.",
    );
}
export async function decodeFile(file: File): Promise<SourceImage> {
  validateFile(file);
  const header = headerDimensions(
    new Uint8Array(await file.slice(0, 1024 * 1024).arrayBuffer()),
  );
  if (header) validateDimensions(header.width, header.height);
  let image: ImageBitmap;
  try {
    image = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(
      "We could not read this image. It may be damaged. Try another PNG, JPG, or WebP.",
    );
  }
  try {
    validateDimensions(image.width, image.height);
  } catch (e) {
    image.close();
    throw e;
  }
  return { image, name: file.name, width: image.width, height: image.height };
}
