"use client";
import useSWR from "swr";
import type { User } from "@/types";

type Liker = Pick<User, "id" | "first_name" | "last_name" | "avatar_url">;

async function fetcher(url: string): Promise<Liker[]> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load likers");
  const json = await res.json();
  // Unwrap TransformInterceptor envelope: { data: Liker[] }
  const payload = json?.data ?? json;
  return Array.isArray(payload) ? payload : [];
}

export function useLikers(
    type: "posts" | "comments" | "replies",
    id: string,
    open: boolean,
) {
  const url = open ? `/api/${type}/${id}/likes` : null;
  const { data, error, isLoading } = useSWR<Liker[]>(url, fetcher, {
    revalidateOnFocus: false,
  });
  return { likers: data ?? [], error, isLoading };
}
