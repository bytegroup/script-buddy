/**
 * POST /api/auth/register
 *
 * Thin proxy that forwards the registration payload to the backend.
 * Keeps the backend URL server-side only (never exposed to the browser).
 *
 * Request body: { firstName, lastName, email, password }
 * Backend expects: { first_name, last_name, email, password }
 */
import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    // ── Validation (server-side guard — client also validates) ──────────────
    const errors: Record<string, string> = {};
    if (!firstName?.trim()) errors.firstName = "First name is required.";
    if (!lastName?.trim())  errors.lastName  = "Last name is required.";
    if (!email?.trim())     errors.email     = "Email is required.";
    if (!password)          errors.password  = "Password is required.";
    if (password && password.length < 4)
      errors.password = "Password must be at least 4 characters.";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 422 });
    }

    // ── Forward to backend (snake_case mapping) ─────────────────────────────
    const backendRes = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REGISTER}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: firstName.trim(),
        last_name:  lastName.trim(),
        email:      email.trim().toLowerCase(),
        password,
      }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { message: data.message ?? "Registration failed." },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(
      { message: "Registration successful." },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
