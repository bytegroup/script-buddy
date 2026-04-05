import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { serverFetch } from "@/lib/serverFetch";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  if (!body.content?.trim()) return NextResponse.json({ message: "Reply cannot be empty." }, { status: 422 });
  const { data, error, status } = await serverFetch(`/api/comments/${id}/replies`, {
    method: "POST",
    body: JSON.stringify({ content: body.content.trim(), user_id: session.user.id }),
  });
  if (error) return NextResponse.json({ message: error }, { status });
  return NextResponse.json(data, { status: 201 });
}
