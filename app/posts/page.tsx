import Link from "next/link";
import { getPosts } from "@/lib/actions/posts";
import { getProjects } from "@/lib/actions/projects";
import { Plus } from "lucide-react";
import { PostsClient } from "@/components/posts/posts-client";

export default async function PostsPage() {
  const [posts, projects] = await Promise.all([getPosts(), getProjects()]);

  const stats = {
    total: posts.length,
    draft: posts.filter((p) => p.status === "draft").length,
    scheduled: posts.filter((p) => p.status === "scheduled").length,
    published: posts.filter((p) => p.status === "published").length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crée, planifie et suis tes contenus
          </p>
        </div>
        <Link
          href="/posts/new"
          className="flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-black hover:bg-white/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau post
        </Link>
      </div>

      {/* Mini dashboard */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "" },
          { label: "Brouillons", value: stats.draft, color: "text-muted-foreground" },
          { label: "Planifiés", value: stats.scheduled, color: "text-yellow-400" },
          { label: "Publiés", value: stats.published, color: "text-emerald-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-border/50 bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className={`mt-2 text-3xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <PostsClient posts={posts} projects={projects} />
    </div>
  );
}
