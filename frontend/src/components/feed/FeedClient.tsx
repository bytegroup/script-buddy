"use client";

import { useEffect, useRef, useCallback } from "react";
import { useFeed } from "@/hooks/useFeed";
import CreatePostBox from "./CreatePostBox";
import PostCard from "./PostCard";
import type { Post, PaginatedResponse } from "@/types";

interface Props {
  currentUserId: string;
  authorName:    string;
}

export default function FeedClient({ currentUserId, authorName }: Props) {
  const {
    posts, hasMore, isEmpty, isLoading,
    isLoadingMore, error, loadMore, refresh, mutateFeed,
  } = useFeed();

  // ── Infinite scroll sentinel ─────────────────────────────────────────────────
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoadingMore) loadMore();
      },
      { rootMargin: "200px" },
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, isLoadingMore, loadMore]);

  const handleLike = useCallback(
    (postId: string, liked: boolean) => {
      mutateFeed(
        (pages: PaginatedResponse<Post>[] | undefined) =>
          pages?.map((page) => ({
            ...page,
            // page.data is Post[] — safe to map directly
            data: Array.isArray(page.data)
              ? page.data.map((p: Post) =>
                  p.id === postId
                    ? {
                        ...p,
                        likedByMe:  liked,
                        likesCount: p.likes_count + (liked ? 1 : -1),
                      }
                    : p,
                )
              : page.data,
          })),
        { revalidate: false },
      );
    },
    [mutateFeed],
  );

  return (
    <div>
      {/* Create post */}
      <CreatePostBox authorName={authorName} onPostCreated={refresh} />

      {/* Loading state */}
      {isLoading && !posts.length && (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border spinner-border-sm me-2" role="status" />
          Loading feed…
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="alert alert-danger text-center">
          {(error as Error)?.message ?? "Failed to load feed."}
        </div>
      )}

      {/* Empty state */}
      {isEmpty && !isLoading && (
        <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16 text-center text-muted py-5">
          <p className="mb-1">No posts yet.</p>
          <p className="small">Be the first to share something!</p>
        </div>
      )}

      {/* Post list */}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onLike={handleLike}
        />
      ))}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} />

      {/* Load-more indicator */}
      {isLoadingMore && (
        <div className="text-center py-3 text-muted small">
          <div className="spinner-border spinner-border-sm me-2" role="status" />
          Loading more posts…
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-4 text-muted small">
          You&apos;re all caught up ✓
        </div>
      )}
    </div>
  );
}
