"use client";
/**
 * ImageUpload.tsx
 *
 * Implements the Cloudinary direct upload flow:
 *   1. Client requests signed upload config from /api/cloudinary/sign
 *   2. Server generates a short-lived signature (API secret stays server-side)
 *   3. Client uploads file directly to Cloudinary via XHR (for progress tracking)
 *   4. Cloudinary returns the secure image URL
 *   5. Parent receives the URL to store with the post
 *
 * Uses XMLHttpRequest (not fetch) for upload progress events.
 */
import { useState, useRef, useCallback } from "react";
import Image from "next/image";

interface Props {
  onUpload: (url: string) => void;
  onClear:  () => void;
  disabled?: boolean;
}

export default function ImageUpload({ onUpload, onClear, disabled }: Props) {
  const [preview,  setPreview]  = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const fileRef  = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be smaller than 10 MB.");
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setProgress(0);

    try {
      // Step 1: Get signed upload params from our server
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        credentials: "include",
      });

      if (!signRes.ok) {
        const err = await signRes.json();
        throw new Error(err.message ?? "Failed to get upload signature.");
      }

      const { uploadUrl, apiKey, timestamp, signature, folder } = await signRes.json();

      // Step 2: Upload directly to Cloudinary via XHR (needed for progress)
      const formData = new FormData();
      formData.append("file",       file);
      formData.append("api_key",    apiKey);
      formData.append("timestamp",  String(timestamp));
      formData.append("signature",  signature);
      formData.append("folder",     folder);

      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.secure_url as string);
          } else {
            reject(new Error("Cloudinary upload failed."));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload."));

        xhr.open("POST", uploadUrl);
        xhr.send(formData);
      });

      setProgress(100);
      onUpload(url);
    } catch (e) {
      setError((e as Error).message);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    setPreview(null);
    setProgress(0);
    setError(null);
    onClear();
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="mb-2">
      {!preview && (
        <label
          className="d-flex align-items-center gap-2 text-muted small"
          style={{ cursor: disabled ? "not-allowed" : "pointer" }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="d-none"
            onChange={handleChange}
            disabled={disabled || uploading}
          />
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
            <path fill="#666" d="M15 11v3H3v-3H1v3a2 2 0 002 2h12a2 2 0 002-2v-3h-2zm-5-9l-4 4h3v6h2V6h3L10 2z"/>
          </svg>
          <span>Add photo</span>
        </label>
      )}

      {preview && (
        <div className="position-relative d-inline-block">
          <Image
            src={preview}
            alt="Preview"
            width={200}
            height={120}
            className="rounded-3"
            style={{ objectFit: "cover", width: 200, height: 120 }}
          />
          {!uploading && (
            <button
              type="button"
              className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 24, height: 24, padding: 0, lineHeight: 1 }}
              onClick={handleClear}
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Progress bar */}
      {uploading && (
        <div className="progress mt-2" style={{ height: 6 }}>
          <div
            className="progress-bar bg-primary"
            role="progressbar"
            style={{ width: `${progress}%`, transition: "width 0.2s" }}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}
      {uploading && (
        <p className="text-muted small mt-1">Uploading… {progress}%</p>
      )}

      {error && <p className="field-error mt-1">{error}</p>}
    </div>
  );
}
