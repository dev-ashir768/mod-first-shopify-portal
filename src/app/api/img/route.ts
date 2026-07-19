import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("Missing url", { status: 400 });

  let targetUrl: URL;
  try {
    targetUrl = new URL(url);
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/api\/.*$/, "").replace(/\/$/, "");
  const allowedOrigin = apiBase ? new URL(apiBase).origin : null;
  if (!allowedOrigin || targetUrl.origin !== allowedOrigin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const upstream = await fetch(targetUrl.toString(), { cache: "force-cache" });
  if (!upstream.ok) return new NextResponse("Not found", { status: 404 });

  const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
