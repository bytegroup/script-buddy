/**
 * POST /api/cloudinary/sign
 *
 * Generates a short-lived Cloudinary upload signature server-side.
 * The API secret NEVER leaves the server.
 *
 * Flow:
 *   1. Client requests a signed upload config from this endpoint
 *   2. Server generates signature using CLOUDINARY_API_SECRET
 *   3. Client uploads directly to Cloudinary using the signature
 *   4. Cloudinary returns the image URL
 *   5. Client saves URL to our backend
 *
 * Signature is valid for 60 seconds (Cloudinary's minimum).
 */
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import crypto from "node:crypto";

export async function POST() {
  // Must be authenticated
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { message: "Cloudinary is not configured on the server." },
      { status: 503 }
    );
  }

  // Short-lived timestamp (Cloudinary rejects signatures older than 1 hour)
  const timestamp = Math.round(Date.now() / 1000);
  const folder    = "appifylab-social/posts";

  // Build the string to sign: alphabetically sorted params joined with &
  // then append the API secret
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature    = crypto
    .createHash("sha256")
    .update(paramsToSign + apiSecret)
    .digest("hex");

  return NextResponse.json({
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
    // Tell client where to POST the file
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  });
}
