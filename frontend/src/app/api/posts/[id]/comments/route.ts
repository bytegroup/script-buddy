import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { serverFetch } from "@/lib/serverFetch";
import type { Comment } from "@/types";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { data, error, status } = await serverFetch<Comment[]>(`/api/posts/${id}/comments`);
  if (error) return NextResponse.json({ message: error }, { status });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  if (!body.content?.trim()) return NextResponse.json({ message: "Comment cannot be empty." }, { status: 422 });
  const { data, error, status } = await serverFetch(`/api/posts/${id}/comments`, {
    method: "POST",
    body: JSON.stringify({ content: body.content.trim(), user_id: session.user.id }),
  });
  if (error) return NextResponse.json({ message: error }, { status });
  return NextResponse.json(data, { status: 201 });
}
