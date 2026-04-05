"use client";
import useSWR from "swr";
import type { Comment } from "@/types";

async function fetcher(url: string): Promise<Comment[]> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load comments");
  return res.json();
}

export function useComments(postId: string, open: boolean) {
  const { data, error, isLoading, mutate } = useSWR<Comment[]>(
    open ? `/api/posts/${postId}/comments` : null,
    fetcher,
    { revalidateOnFocus: false }
  );
  return { comments: data ?? [], error, isLoading, mutate };
}
