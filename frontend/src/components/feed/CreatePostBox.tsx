"use client";
import { useState, useCallback } from "react";
import ImageUpload from "./ImageUpload";
import type { PostVisibility } from "@/types";

interface Props {
  authorName: string;
  onPostCreated: () => void;
}

export default function CreatePostBox({ authorName, onPostCreated }: Props) {
  const [content,    setContent]    = useState("");
  const [imageUrl,   setImageUrl]   = useState<string | null>(null);
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) {
      setError("Please write something or add a photo.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/posts", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ content: content.trim(), imageUrl, visibility }),
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Failed to create post.");
      setSubmitting(false);
      return;
    }

    setContent("");
    setImageUrl(null);
    setVisibility("public");
    setSubmitting(false);
    onPostCreated();
  };

  const handleImageUpload = useCallback((url: string) => setImageUrl(url), []);
  const handleImageClear  = useCallback(() => setImageUrl(null), []);

  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <form onSubmit={handleSubmit}>

          {/* Author row */}
          <div className="d-flex gap-2 align-items-center mb-3">
            <div
              className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
              style={{ width: 44, height: 44, fontSize: 15 }}
            >
              {initials}
            </div>
            <div className="flex-grow-1">
              <textarea
                className="form-control border-0 bg-transparent"
                rows={2}
                placeholder={`What's on your mind, ${authorName.split(" ")[0]}?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={submitting}
                style={{ resize: "none", fontSize: 14, boxShadow: "none", padding: "6px 0" }}
              />
            </div>
          </div>

          {/* Image upload */}
          <ImageUpload
            onUpload={handleImageUpload}
            onClear={handleImageClear}
            disabled={submitting}
          />

          {error && <p className="field-error mb-2">{error}</p>}

          {/* Bottom bar: visibility + submit */}
          <div className="d-flex align-items-center justify-content-between border-top pt-2 mt-2">
            {/* Visibility toggle */}
            <div className="d-flex align-items-center gap-2">
              <label className="small text-muted mb-0">Who can see:</label>
              <select
                className="form-select form-select-sm"
                style={{ width: "auto", fontSize: 13 }}
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as PostVisibility)}
                disabled={submitting}
              >
                <option value="public">🌍 Everyone</option>
                <option value="private">🔒 Only me</option>
              </select>
            </div>

            <button
              type="submit"
              className="_feed_inner_text_area_btn_link btn btn-primary btn-sm px-4"
              disabled={submitting || (!content.trim() && !imageUrl)}
              style={{ opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? "Posting…" : "Post"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
