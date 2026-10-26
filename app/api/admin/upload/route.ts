import {isSameOrigin} from '@/lib/admin-security';
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function extensionOf(filename: string) {
  const match = filename.toLowerCase().match(/\.[a-z0-9]{1,8}$/);
  return match?.[0] ?? "";
}

export async function PUT(request: Request) {
  if (!(await getAdminUser())) return NextResponse.json({ error: "无管理员权限" }, { status: 403 });

  if (!isSameOrigin(request)) return NextResponse.json({error:"请求来源无效"},{status:403});
  const kind = new URL(request.url).searchParams.get("kind");
  if (kind !== "cover" && kind !== "pdf") {
    return NextResponse.json({ error: "文件类型无效" }, { status: 400 });
  }
  if (!request.body) return NextResponse.json({ error: "文件为空" }, { status: 400 });

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 500 * 1024 * 1024) {
    return NextResponse.json({ error: "文件不能超过 500MB" }, { status: 413 });
  }

  const originalName = decodeURIComponent(request.headers.get("x-file-name") || "file");
  const contentType = request.headers.get("content-type") || "application/octet-stream";
  if (kind === "pdf" && contentType !== "application/pdf") {
    return NextResponse.json({ error: "请上传 PDF 文件" }, { status: 400 });
  }
  if (kind === "cover" && !contentType.startsWith("image/")) {
    return NextResponse.json({ error: "请上传图片文件" }, { status: 400 });
  }

  const key = `uploads/${kind}/${Date.now()}-${crypto.randomUUID()}${extensionOf(originalName)}`;
  try {
    const { env } = await import("cloudflare:workers");
    await env.BUCKET.put(key, request.body, {
      httpMetadata: { contentType },
      customMetadata: { originalName },
    });
    return NextResponse.json({ key, url: `/media/${key}` });
  } catch (error) {
    console.error("Unable to upload file", error);
    return NextResponse.json({ error: "上传失败，请稍后重试" }, { status: 500 });
  }
}
