"use client";

import Link from "next/link";
import { useState } from "react";

type Post = {
  id: string;
  title: string;
  platform: string;
  status: string;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  project: { id: string; name: string };
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-white/5 text-muted-foreground",
  scheduled: "bg-yellow-500/15 text-yellow-400",
  published: "bg-emerald-500/15 text-emerald-400",
  archived: "bg-white/5 text-muted-foreground",
};
const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon", scheduled: "Planifié", published: "Publié", archived: "Archivé",
};
const PLATFORM_EMOJIS: Record<string, string> = {
  linkedin: "💼", twitter: "🐦", instagram: "📸", facebook: "👤", tiktok: "🎵",
};
const PLATFORMS = ["Tous", "linkedin", "twitter", "instagram", "tiktok"];
const STATUSES = ["Tous", "draft", "scheduled", "published"];

export function PostsList({ posts }: { posts: Post[] }) {
  const [platform, setPlatform] = useState("Tous");
  const [status, setStatus] = useState("Tous");

  const filtered = posts.filter((p) => {
    if (platform !== "Tous" && p.platform !== platform) return false;
    if (status !== "Tous" && p.status !== status) return false;
    return true;
  });

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-card p-1">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                platform === p ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "Tous" ? "Tous" : `${PLATFORM_EMOJIS[p]} ${p.charAt(0).toUpperCase() + p.slice(1)}`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-card p-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                status === s ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "Tous" ? "Tous" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="flex items-center justify-between rounded-xl border border-border/50 bg-card px-5 py-4 hover:border-border transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-lg shrink-0">{PLATFORM_EMOJIS[post.platform] ?? "📝"}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{post.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{post.project.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              {post.scheduledAt && (
                <span className="text-xs text-muted-foreground">
                  {new Date(post.scheduledAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </span>
              )}
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[post.status]}`}>
                {STATUS_LABELS[post.status]}
              </span>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Aucun post pour ces filtres</p>
        )}
      </div>
    </div>
  );
}
