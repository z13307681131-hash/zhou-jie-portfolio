export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ key: string[] }> },
) {
  const { env } = await import("cloudflare:workers");
  const { key: parts } = await context.params;
  const key = parts.join("/");
  const rangeHeader = request.headers.get("range");
  const object = await env.BUCKET.get(
    key,
    rangeHeader ? { range: request.headers } : undefined,
  );

  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("accept-ranges", "bytes");
  headers.set("cache-control", "public, max-age=31536000, immutable");
  const originalName = object.customMetadata?.originalName;
  if (headers.get("content-type") === "application/pdf") {
    headers.set(
      "content-disposition",
      `inline${originalName ? `; filename*=UTF-8''${encodeURIComponent(originalName)}` : ""}`,
    );
  }

  if (object.range) {
    const offset = "offset" in object.range ? object.range.offset : 0;
    const length = "length" in object.range ? object.range.length : object.size;
    headers.set("content-range", `bytes ${offset}-${offset + length - 1}/${object.size}`);
    headers.set("content-length", String(length));
    return new Response(object.body, { status: 206, headers });
  }

  headers.set("content-length", String(object.size));
  return new Response(object.body, { headers });
}
