"use client";
import { useState, useCallback } from "react";
import type { Comment, Reply } from "@/types";
import LikersModal from "./LikersModal";

interface Props {
  comment:     Comment;
  currentUserId: string;
  onLike:      (commentId: string, liked: boolean) => void;
  onReply:     (commentId: string, content: string) => Promise<void>;
  onReplyLike: (replyId: string, liked: boolean) => void;
}

export default function CommentItem({ comment, currentUserId, onLike, onReply, onReplyLike }: Props) {
  const [showReplies,  setShowReplies]  = useState(false);
  const [replyText,    setReplyText]    = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [showLikers,   setShowLikers]   = useState(false);
  const [likerTarget,  setLikerTarget]  = useState<{ type: "comments" | "replies"; id: string } | null>(null);
  const [localLiked,   setLocalLiked]   = useState(comment.likedByMe);
  const [localCount,   setLocalCount]   = useState(comment.likesCount);

  const handleLike = useCallback(() => {
    const next = !localLiked;
    setLocalLiked(next);
    setLocalCount((c) => c + (next ? 1 : -1));
    onLike(comment.id, next);
  }, [localLiked, comment.id, onLike]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    await onReply(comment.id, replyText.trim());
    setReplyText("");
    setSubmitting(false);
    setShowReplies(true);
  };

  return (
    <div className="mb-2">
      <div className="d-flex gap-2 align-items-start">
        {/* Avatar */}
        <div
          className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
          style={{ width: 32, height: 32, fontSize: 12 }}
        >
          {(comment.author.first_name?.[0] ?? "?").toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          {/* Comment bubble */}
          <div className="px-3 py-2 rounded-3" style={{ background: "var(--bg3, #f5f5f5)" }}>
            <span className="fw-semibold small me-2">
              {comment.author.first_name} {comment.author.last_name}
            </span>
            <p><span className="small">{comment.content}</span></p>
          </div>

          {/* Actions */}
          <div className="d-flex gap-3 align-items-center mt-1" style={{ paddingLeft: 4 }}>
            <button
              className={`btn btn-link btn-sm p-0 text-decoration-none small ${localLiked ? "text-primary fw-semibold" : "text-muted"}`}
              onClick={handleLike}
            >
              {localLiked ? "Unlike" : "Like"}
            </button>

            {localCount > 0 && (
              <button
                className="btn btn-link btn-sm p-0 text-muted text-decoration-none small"
                onClick={() => { setLikerTarget({ type: "comments", id: comment.id }); setShowLikers(true); }}
              >
                {localCount} {localCount === 1 ? "like" : "likes"}
              </button>
            )}

            <button
              className="btn btn-link btn-sm p-0 text-muted text-decoration-none small"
              onClick={() => setShowReplies((v) => !v)}
            >
              {comment.replies.length > 0 ? `${comment.replies.length} replies` : "Reply"}
            </button>
          </div>

          {/* Replies */}
          {showReplies && (
            <div className="mt-2 ms-2">
              {comment.replies.map((reply) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  currentUserId={currentUserId}
                  onLike={onReplyLike}
                  onShowLikers={(id) => { setLikerTarget({ type: "replies", id }); setShowLikers(true); }}
                />
              ))}

              {/* Reply input */}
              <form onSubmit={handleReplySubmit} className="d-flex gap-2 mt-1">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply…"
                  className="form-control form-control-sm"
                  disabled={submitting}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submitting || !replyText.trim()}
                >
                  {submitting ? "…" : "Send"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {showLikers && likerTarget && (
        <LikersModal
          type={likerTarget.type}
          id={likerTarget.id}
          open={showLikers}
          onClose={() => { setShowLikers(false); setLikerTarget(null); }}
        />
      )}
    </div>
  );
}

function ReplyItem({
  reply, currentUserId, onLike, onShowLikers,
}: {
  reply: Reply;
  currentUserId: string;
  onLike: (id: string, liked: boolean) => void;
  onShowLikers: (id: string) => void;
}) {
  const [localLiked, setLocalLiked] = useState(reply.likedByMe);
  const [localCount, setLocalCount] = useState(reply.likesCount);

  const handleLike = () => {
    const next = !localLiked;
    setLocalLiked(next);
    setLocalCount((c) => c + (next ? 1 : -1));
    onLike(reply.id, next);
  };

  return (
    <div className="d-flex gap-2 align-items-start mb-1">
      <div
        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
        style={{ width: 26, height: 26, fontSize: 11 }}
      >
        {(reply.author.first_name?.[0] ?? "?").toUpperCase()}
      </div>
      <div>
        <div className="px-2 py-1 rounded-3" style={{ background: "var(--bg3, #f5f5f5)" }}>
          <span className="fw-semibold" style={{ fontSize: 12 }}>{reply.author.first_name} {reply.author.last_name} </span>
          <p><span style={{ fontSize: 12 }}>{reply.content}</span></p>
        </div>
        <div className="d-flex gap-2 mt-1" style={{ paddingLeft: 4 }}>
          <button
            className={`btn btn-link p-0 text-decoration-none ${localLiked ? "text-primary fw-semibold" : "text-muted"}`}
            style={{ fontSize: 11 }}
            onClick={handleLike}
          >
            {localLiked ? "Unlike" : "Like"}
          </button>
          {localCount > 0 && (
            <button
              className="btn btn-link p-0 text-muted text-decoration-none"
              style={{ fontSize: 11 }}
              onClick={() => onShowLikers(reply.id)}
            >
              {localCount} {localCount === 1 ? "like" : "likes"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
