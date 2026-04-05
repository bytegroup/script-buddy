"use client";
import useSWR from "swr";
import type { User } from "@/types";

async function fetcher(url: string): Promise<Pick<User, "id" | "firstName" | "lastName" | "avatarUrl">[]> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load likers");
  return res.json();
}

export function useLikers(type: "posts" | "comments" | "replies", id: string, open: boolean) {
  const url = open ? `/api/${type}/${id}/likes` : null;
  const { data, error, isLoading } = useSWR(url, fetcher, { revalidateOnFocus: false });
  return { likers: data ?? [], error, isLoading };
}
