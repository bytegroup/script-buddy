"use client";
import { useLikers } from "@/hooks/useLikers";

interface Props {
  type: "posts" | "comments" | "replies";
  id:   string;
  open: boolean;
  onClose: () => void;
}

export default function LikersModal({ type, id, open, onClose }: Props) {
  const { likers, isLoading } = useLikers(type, id, open);
  if (!open) return null;

  return (
    <div
      className="modal d-block"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-dialog modal-dialog-centered modal-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header py-2 px-3">
            <h6 className="modal-title mb-0 fw-semibold">Liked by</h6>
            <button className="btn-close" onClick={onClose} aria-label="Close" />
          </div>
          <div className="modal-body px-3 py-2" style={{ maxHeight: 280, overflowY: "auto" }}>
            {isLoading && <p className="text-muted small text-center py-2">Loading…</p>}
            {!isLoading && likers.length === 0 && (
              <p className="text-muted small text-center py-2">No likes yet.</p>
            )}
            {likers.map((u) => (
              <div key={u.id} className="d-flex align-items-center gap-2 py-1">
                <div
                  className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-bold"
                  style={{ width: 32, height: 32, fontSize: 13, flexShrink: 0 }}
                >
                  {(u.firstName?.[0] ?? "?").toUpperCase()}
                </div>
                <span className="small">{u.firstName} {u.lastName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
