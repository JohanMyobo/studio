import { getProject } from "@/lib/actions/projects";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Plus, FileText, Paperclip,
  Calendar, CheckSquare, ExternalLink
} from "lucide-react";
import { AssetUploader } from "@/components/projects/asset-uploader";
import { TasksContainer } from "@/components/tasks/tasks-container";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400",
  paused: "bg-yellow-500/15 text-yellow-400",
  completed: "bg-blue-500/15 text-blue-400",
  archived: "bg-white/5 text-muted-foreground",
  draft: "bg-white/5 text-muted-foreground",
  scheduled: "bg-yellow-500/15 text-yellow-400",
  published: "bg-emerald-500/15 text-emerald-400",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Actif", paused: "En pause", completed: "Terminé", archived: "Archivé",
  draft: "Brouillon", scheduled: "Planifié", published: "Publié",
};

const PLATFORM_EMOJIS: Record<string, string> = {
  linkedin: "💼", twitter: "🐦", instagram: "📸",
  facebook: "👤", tiktok: "🎵",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const doneTasks = (project.tasks as any[]).filter((t) => t.status === "done").length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/projects"
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Projets
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[project.status]}`}>
                {STATUS_LABELS[project.status]}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
              {project.client && <span>{project.client}</span>}
              {project.type && <span>· {project.type}</span>}
              {project.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(project.deadline).toLocaleDateString("fr-FR", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </span>
              )}
            </div>
            {project.description && (
              <p className="mt-2 text-sm text-muted-foreground max-w-xl">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DeleteProjectButton projectId={project.id} />
            <Link
              href={`/posts/new?projectId=${project.id}`}
              className="flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              Créer un post
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main content */}
        <div className="col-span-2 space-y-6">

          {/* Tasks */}
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
                Tâches
                {project.tasks.length > 0 && (
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    ({doneTasks}/{project.tasks.length})
                  </span>
                )}
              </h2>
              {project.tasks.length > 0 && (
                <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${project.tasks.length ? (doneTasks / project.tasks.length) * 100 : 0}%` }}
                  />
                </div>
              )}
            </div>

            <TasksContainer
              initialTasks={project.tasks as any}
              phases={project.phases}
              projectId={project.id}
            />
          </div>

          {/* Assets */}
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                Assets ({project._count.assets})
              </h2>
            </div>
            <AssetUploader projectId={project.id} assets={project.assets} />
          </div>

          {/* Posts */}
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Posts ({project._count.posts})
              </h2>
              <Link
                href={`/posts/new?projectId=${project.id}`}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Nouveau
              </Link>
            </div>

            {project.posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm text-muted-foreground">Aucun post pour ce projet</p>
                <Link
                  href={`/posts/new?projectId=${project.id}`}
                  className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                >
                  Créer le premier post
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {(project.posts as any[]).map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span>{PLATFORM_EMOJIS[post.platform] ?? "📝"}</span>
                      <span className="text-sm truncate">{post.title}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[post.status]}`}>
                        {STATUS_LABELS[post.status]}
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Infos</h3>
            <div className="space-y-3 text-sm">
              {[
                { label: "Client", value: project.client },
                { label: "Type", value: project.type },
                {
                  label: "Deadline",
                  value: project.deadline
                    ? new Date(project.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                    : null,
                },
                {
                  label: "Créé le",
                  value: project.created_at
                    ? new Date(project.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
                    : null,
                },
              ].map(({ label, value }) =>
                value ? (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ) : null
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Tâches", value: project._count.tasks },
                { label: "Posts", value: project._count.posts },
                { label: "Assets", value: project._count.assets },
                {
                  label: "Phases",
                  value: project.phases.length,
                },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-semibold">{value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Phases */}
          {project.phases.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Phases</h3>
              <div className="space-y-2">
                {(project.phases as any[]).map((phase) => (
                  <div key={phase.id} className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: phase.color }}
                    />
                    <span className="text-sm">{phase.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {(project.tasks as any[]).filter((t) => t.phaseId === phase.id).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
