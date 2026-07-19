import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Prepend the API base origin to relative image paths, proxied to avoid CORP blocks. */
export function imgUrl(src?: string | null): string {
  if (!src) return "";
  if (src.startsWith("data:") || src.startsWith("blob:")) return src;
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/api\/.*$/, "").replace(/\/$/, "");
  const absolute = src.startsWith("http://") || src.startsWith("https://")
    ? src
    : `${base}${src.startsWith("/") ? "" : "/"}${src}`;
  // Proxy through Next.js to bypass Cross-Origin-Resource-Policy: same-origin
  return `/api/img?url=${encodeURIComponent(absolute)}`;
}
