import { NextResponse } from "next/server";

export const runtime = "edge"; // lightweight, fast cold starts

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "appifylab-social-frontend",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
