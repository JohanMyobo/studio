"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { PostsList } from "./posts-list";
import { PostsCalendar } from "./posts-calendar";

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

type Project = { id: string; name: string; status: string };

type Props = {
  posts: Post[];
  projects: Project[];
};

type View = "list" | "calendar";

export function PostsClient({ posts, projects }: Props) {
  const [view, setView] = useState<View>("list");

  return (
    <div>
      {/* View switcher */}
      <div className="mb-6 flex items-center gap-1 rounded-lg border border-border/50 bg-card p-1 w-fit">
        {(["list", "calendar"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors capitalize ${
              view === v
                ? "bg-white/10 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {v === "list" ? "Liste" : "Calendrier"}
          </button>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 mb-4">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Aucun post</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            Crée ton premier post et associe-le à un projet
          </p>
          <Link
            href="/posts/new"
            className="mt-4 flex items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 text-sm font-medium hover:bg-white/15 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Créer un post
          </Link>
        </div>
      ) : view === "list" ? (
        <PostsList posts={posts} />
      ) : (
        <PostsCalendar posts={posts} />
      )}
    </div>
  );
}
