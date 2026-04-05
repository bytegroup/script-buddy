"use client";

import useSWRInfinite from "swr/infinite";
import type { PaginatedResponse, Post } from "@/types";

const PAGE_SIZE = 10;

// ── Fetcher: unwraps the { data: <payload> } envelope ────────────────────────
async function fetcher(url: string): Promise<PaginatedResponse<Post>> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch feed");

  const json = await res.json();

  // Backend TransformInterceptor wraps every response: { data: <actual>, statusCode, timestamp }
  // Unwrap it so callers always receive PaginatedResponse<Post> directly.
  const payload = json?.data ?? json;

  // Normalise: guarantee `data` is always an array even if backend sends null/undefined
  return {
    data:        Array.isArray(payload?.data) ? payload.data : [],
    hasNextPage: payload?.hasNextPage ?? false,
    total:       payload?.total       ?? 0,
    page:        payload?.page        ?? 1,
    limit:       payload?.limit       ?? PAGE_SIZE,
  };
}

// ── SWR key factory ───────────────────────────────────────────────────────────
function getKey(
  pageIndex: number,
  previousPageData: PaginatedResponse<Post> | null,
) {
  // No more pages
  if (previousPageData && !previousPageData.hasNextPage) return null;
  // First page
  if (pageIndex === 0) return `/api/posts?limit=${PAGE_SIZE}`;
  // Cursor = id of last post on the previous page
  const lastPost = previousPageData?.data?.at(-1);
  if (!lastPost) return null;
  return `/api/posts?limit=${PAGE_SIZE}&cursor=${lastPost.id}`;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useFeed() {
  const {
    data, error, isLoading, isValidating,
    size, setSize, mutate,
  } = useSWRInfinite<PaginatedResponse<Post>>(getKey, fetcher, {
    revalidateOnFocus:   false,
    revalidateFirstPage: true,
    dedupingInterval:    5_000,
  });

  // `data` is PaginatedResponse<Post>[] — one entry per loaded page
  const posts         = data?.flatMap((page) => page.data) ?? [];
  const hasMore       = data?.at(-1)?.hasNextPage ?? false;
  const isEmpty       = posts.length === 0 && !isLoading;
  const isLoadingMore =
    isLoading || (size > 0 && data != null && data[size - 1] === undefined);

  return {
    posts,
    hasMore,
    isEmpty,
    isLoading,
    isLoadingMore,
    isValidating,
    error,
    loadMore:   () => setSize((s) => s + 1),
    refresh:    () => mutate(),
    mutateFeed: mutate,
  };
}
