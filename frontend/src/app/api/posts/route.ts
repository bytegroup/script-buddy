/**
 * GET  /api/posts  — paginated feed (cursor-based)
 * POST /api/posts  — create a post
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { serverFetch } from "@/lib/serverFetch";
import type { PaginatedResponse, Post } from "@/types";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit  = searchParams.get("limit")  ?? "10";

  const { data, error, status } = await serverFetch<PaginatedResponse<Post>>("/api/posts", {
    params: { cursor, limit },
  });

  if (error) return NextResponse.json({ message: error }, { status });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // Validation: must have content or imageUrl
  if (!body.content?.trim() && !body.imageUrl) {
    return NextResponse.json(
      { message: "Post must have text content or an image." },
      { status: 422 }
    );
  }

  if (!["public", "private"].includes(body.visibility)) {
    return NextResponse.json({ message: "Visibility must be public or private." }, { status: 422 });
  }

  const { data, error, status } = await serverFetch<Post>("/api/posts", {
    method: "POST",
    body: JSON.stringify({
      content:    body.content?.trim() ?? "",
      image_url:  body.imageUrl ?? null,
      visibility: body.visibility,
      user_id:    session.user.id,
    }),
  });

  if (error) return NextResponse.json({ message: error }, { status });
  return NextResponse.json(data, { status: 201 });
}
