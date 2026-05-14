import Link from "next/link";
import { getProjects } from "@/lib/actions/projects";
import { getPosts } from "@/lib/actions/posts";
import { getCurrentEntityId } from "@/lib/entity";
import { prisma } from "@/lib/prisma";
import {
  FolderKanban, FileText, Users, TrendingUp, ArrowUpRight, Plus,
} from "lucide-react";

export default async function DashboardPage() {
  const entityId = await getCurrentEntityId();

  const [projects, posts] = await Promise.all([
    getProjects(),
    getPosts(),
  ]);

  const contactsCount = entityId
    ? await prisma.contact.count({ where: { entityId } })
    : 0;

  const entity = entityId
    ? await prisma.entity.findUnique({ where: { id: entityId } })
    : null;

  const stats = [
    {
      label: "Projets actifs",
      value: projects.filter((p) => p.status === "active").length,
      total: projects.length,
      icon: FolderKanban,
      href: "/projects",
    },
    {
      label: "Posts",
      value: posts.filter((p) => p.status !== "archived").length,
      sub: `${posts.filter((p) => p.status === "published").length} publiés`,
      icon: FileText,
      href: "/posts",
    },
    {
      label: "Contacts",
      value: contactsCount,
      icon: Users,
      href: "/crm",
    },
    {
      label: "Posts planifiés",
      value: posts.filter((p) => p.status === "scheduled").length,
      icon: TrendingUp,
      href: "/posts",
    },
  ];

  const recentProjects = projects.slice(0, 4);
  const recentPosts = posts.slice(0, 5);

  const STATUS_STYLES: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-400",
    paused: "bg-yellow-500/15 text-yellow-400",
    completed: "bg-blue-500/15 text-blue-400",
    draft: "bg-white/5 text-muted-foreground",
    scheduled: "bg-yellow-500/15 text-yellow-400",
    published: "bg-emerald-500/15 text-emerald-400",
  };
  const STATUS_LABELS: Record<string, string> = {
    active: "Actif", paused: "Pause", completed: "Terminé",
    draft: "Brouillon", scheduled: "Planifié", published: "Publié",
  };
  const PLATFORM_EMOJIS: Record<string, string> = {
    linkedin: "💼", twitter: "🐦", instagram: "📸", facebook: "👤", tiktok: "🎵",
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {entity ? `${entity.emoji} ${entity.name}` : "Dashboard"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Vue d&apos;ensemble de ton activité</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-xl border border-border/50 bg-card p-5 hover:border-border transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 group-hover:bg-white/10 transition-colors">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
            {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
          </Link>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Recent projects */}
        <div className="col-span-2 rounded-xl border border-border/50 bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Projets récents</h2>
            <Link href="/projects/new" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="h-3.5 w-3.5" /> Nouveau
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm text-muted-foreground">Aucun projet</p>
              <Link href="/projects/new" className="mt-2 text-xs text-white/60 hover:text-white underline underline-offset-4 transition-colors">
                Créer le premier
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentProjects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FolderKanban className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-sm truncate">{p.name}</p>
                      {p.client && <p className="text-xs text-muted-foreground">{p.client}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground">{p._count.posts} posts</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[p.status]}`}>
                      {STATUS_LABELS[p.status]}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent posts */}
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Posts récents</h2>
            <Link href="/posts/new" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="h-3.5 w-3.5" /> Nouveau
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm text-muted-foreground">Aucun post</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/posts/${p.id}`}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-white/5 transition-colors"
                >
                  <span className="text-base">{PLATFORM_EMOJIS[p.platform] ?? "📝"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.project.name}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[p.status]}`}>
                    {STATUS_LABELS[p.status]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
