"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import type { Post } from "@/types";
import { useComments } from "@/hooks/useComments";
import CommentItem from "./CommentItem";
import LikersModal from "./LikersModal";

interface Props {
  post:          Post;
  currentUserId: string;
  onLike:        (postId: string, liked: boolean) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function PostCard({ post, currentUserId, onLike }: Props) {
  const [liked,        setLiked]        = useState(post.liked_by_me);
  const [likesCount,   setLikesCount]   = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [showLikers,   setShowLikers]   = useState(false);
  const [commentText,  setCommentText]  = useState("");
  const [submitting,   setSubmitting]   = useState(false);

  const { comments, isLoading: commentsLoading, mutate: mutateComments } =
    useComments(post.id, showComments);

  // ── Optimistic like ──────────────────────────────────────────────────────────
  const handleLike = useCallback(async () => {
    const next = !liked;
    setLiked(next);
    setLikesCount((c) => c + (next ? 1 : -1));
    onLike(post.id, next);

    await fetch(`/api/posts/${post.id}/like`, {
      method:  next ? "POST" : "DELETE",
      credentials: "include",
    }).catch(() => {
      // Rollback on failure
      setLiked(!next);
      setLikesCount((c) => c + (next ? -1 : 1));
    });
  }, [liked, post.id, onLike]);

  // ── Comment like ─────────────────────────────────────────────────────────────
  const handleCommentLike = useCallback(async (commentId: string, nextLiked: boolean) => {
    await fetch(`/api/comments/${commentId}/like`, {
      method: nextLiked ? "POST" : "DELETE",
      credentials: "include",
    });
    mutateComments();
  }, [mutateComments]);

  // ── Reply ─────────────────────────────────────────────────────────────────────
  const handleReply = useCallback(async (commentId: string, content: string) => {
    await fetch(`/api/comments/${commentId}/replies`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ content }),
      credentials: "include",
    });
    mutateComments();
  }, [mutateComments]);

  // ── Reply like ───────────────────────────────────────────────────────────────
  const handleReplyLike = useCallback(async (replyId: string, nextLiked: boolean) => {
    await fetch(`/api/replies/${replyId}/like`, {
      method: nextLiked ? "POST" : "DELETE",
      credentials: "include",
    });
    mutateComments();
  }, [mutateComments]);

  // ── Submit comment ───────────────────────────────────────────────────────────
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    await fetch(`/api/posts/${post.id}/comments`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ content: commentText.trim() }),
      credentials: "include",
    });
    setCommentText("");
    setSubmitting(false);
    mutateComments();
    setShowComments(true);
  };

  const isOwner = post.author.id === currentUserId;

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">

        {/* ── Post header ─────────────────────────────────────────────────── */}
        <div className="_feed_inner_timeline_post_top mb-3">
          <div className="_feed_inner_timeline_post_box d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                style={{ width: 44, height: 44, fontSize: 16 }}
              >
                {(post.author.first_name?.[0] ?? "?").toUpperCase()}
              </div>
              <div>
                <h4 className="_feed_inner_timeline_post_box_title mb-0" style={{ fontSize: 15 }}>
                  {post.author.first_name} {post.author.last_name}
                </h4>
                <p className="_feed_inner_timeline_post_box_para mb-0" style={{ fontSize: 12 }}>
                  {timeAgo(post.created_at)} &nbsp;·&nbsp;
                  <span
                    className="badge"
                    style={{
                      fontSize: 10,
                      background: post.visibility === "public" ? "#e8f4ff" : "#fff3cd",
                      color:      post.visibility === "public" ? "#1890ff" : "#856404",
                    }}
                  >
                    <span data-visibility={post.visibility}>{post.visibility === "public" ? "🌍 Public" : "🔒 Private"}</span>
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Post content ────────────────────────────────────────────────── */}
        {post.content && (
          <p className="mb-3" style={{ color: "var(--color, #2D3748)", lineHeight: 1.6 }}>
            {post.content}
          </p>
        )}

        {/* ── Post image ──────────────────────────────────────────────────── */}
        {post.image_url && (
          <div className="_feed_inner_timeline_image mb-3 rounded-3 overflow-hidden">
            <Image
              src={post.image_url}
              alt="Post image"
              width={640}
              height={360}
              className="w-100"
              style={{ objectFit: "cover", maxHeight: 400 }}
            />
          </div>
        )}

        {/* ── Likes count ─────────────────────────────────────────────────── */}
        {likesCount > 0 && (
          <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26 d-flex align-items-center gap-2 mb-2"
               style={{ paddingLeft: 0, paddingRight: 0 }}>
            <button
              className="btn btn-link p-0 text-muted text-decoration-none small"
              onClick={() => setShowLikers(true)}
            >
              ❤️ {likesCount} {likesCount === 1 ? "like" : "likes"}
            </button>
          </div>
        )}

        {/* ── Reaction bar ────────────────────────────────────────────────── */}
        <div className="_feed_inner_timeline_reaction d-flex gap-2 border-top border-bottom py-2 mb-3">
          <button
            className={`_feed_reaction btn btn-link text-decoration-none d-flex align-items-center gap-1 small ${liked ? "_feed_reaction_active text-primary fw-semibold" : "text-muted"}`}
            onClick={handleLike}
          >
            <span>{liked ? "❤️" : "🤍"}</span>
            <span>{liked ? "Unlike" : "Like"}</span>
          </button>

          <button
            className="_feed_reaction btn btn-link text-muted text-decoration-none d-flex align-items-center gap-1 small"
            onClick={() => setShowComments((v) => !v)}
          >
            <span>💬</span>
            <span>Comment {post.comments_count > 0 ? `(${post.comments_count})` : ""}</span>
          </button>
        </div>

        {/* ── Comment section ─────────────────────────────────────────────── */}
        {showComments && (
          <div className="_feed_inner_timeline_cooment_area">
            {/* Comment input */}
            <form onSubmit={handleCommentSubmit} className="_feed_inner_comment_box mb-3">
              <div className="d-flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment…"
                  className="form-control _social_login_input"
                  style={{ height: 40, fontSize: 14 }}
                  disabled={submitting}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm px-3"
                  disabled={submitting || !commentText.trim()}
                >
                  {submitting ? "…" : "Post"}
                </button>
              </div>
            </form>

            {/* Comments list */}
            {commentsLoading && <p className="text-muted small">Loading comments…</p>}
            {!commentsLoading && comments.length === 0 && (
              <p className="text-muted small">No comments yet. Be the first!</p>
            )}
            {comments.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                currentUserId={currentUserId}
                onLike={handleCommentLike}
                onReply={handleReply}
                onReplyLike={handleReplyLike}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Likers modal ────────────────────────────────────────────────────── */}
      <LikersModal
        type="posts"
        id={post.id}
        open={showLikers}
        onClose={() => setShowLikers(false)}
      />
    </div>
  );
}
