import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { serverFetch } from "@/lib/serverFetch";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { data, error, status } = await serverFetch(`/api/replies/${id}/likes`);
  if (error) return NextResponse.json({ message: error }, { status });
  return NextResponse.json(data);
}
