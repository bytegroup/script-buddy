"use client";
/**
 * useFeed.ts
 *
 * SWR-powered infinite-scroll hook for the post feed.
 * Uses cursor-based pagination for scalability (millions of posts).
 * Strategy: CSR with SWR — feed is personalized and real-time.
 */
import useSWRInfinite from "swr/infinite";
import type { PaginatedResponse, Post } from "@/types";

const PAGE_SIZE = 10;

async function fetcher(url: string): Promise<PaginatedResponse<Post>> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch feed");
  return res.json();
}

function getKey(pageIndex: number, previousPageData: PaginatedResponse<Post> | null) {
  // No more pages
  if (previousPageData && !previousPageData.hasNextPage) return null;
  // First page
  if (pageIndex === 0) return `/api/posts?limit=${PAGE_SIZE}`;
  // Cursor from last item of previous page
  const lastPost = previousPageData?.data?.at(-1);
  if (!lastPost) return null;
  return `/api/posts?limit=${PAGE_SIZE}&cursor=${lastPost.id}`;
}

export function useFeed() {
  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite<PaginatedResponse<Post>>(getKey, fetcher, {
      revalidateOnFocus:     false,
      revalidateFirstPage:   true,
      dedupingInterval:      5_000,
    });

  const posts        = data?.flatMap((page) => page.data) ?? [];
  const hasMore      = data?.at(-1)?.hasNextPage ?? false;
  const isEmpty      = posts.length === 0 && !isLoading;
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");

  return {
    posts,
    hasMore,
    isEmpty,
    isLoading,
    isLoadingMore,
    isValidating,
    error,
    loadMore:  () => setSize((s) => s + 1),
    refresh:   () => mutate(),
    mutateFeed: mutate,
  };
}
