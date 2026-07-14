import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Prepend the API base origin to relative image paths. */
export function imgUrl(src?: string | null): string {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) return src;
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/api\/.*$/, "").replace(/\/$/, "");
  return `${base}${src.startsWith("/") ? "" : "/"}${src}`;
}
