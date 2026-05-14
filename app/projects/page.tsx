import Link from "next/link";
import { getProjects } from "@/lib/actions/projects";
import { Plus, FolderKanban, FileText, Paperclip, Calendar } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400",
  paused: "bg-yellow-500/15 text-yellow-400",
  completed: "bg-blue-500/15 text-blue-400",
  archived: "bg-white/5 text-muted-foreground",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  paused: "En pause",
  completed: "Terminé",
  archived: "Archivé",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    completed: projects.filter((p) => p.status === "completed").length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gère tes missions et livrables
          </p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-black hover:bg-white/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau projet
        </Link>
      </div>

      {/* Mini dashboard */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Actifs", value: stats.active },
          { label: "Terminés", value: stats.completed },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border/50 bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 mb-4">
            <FolderKanban className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Aucun projet</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            Crée ton premier projet pour commencer à tracker ton travail
          </p>
          <Link
            href="/projects/new"
            className="mt-4 flex items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 text-sm font-medium hover:bg-white/15 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Créer un projet
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group flex items-center justify-between rounded-xl border border-border/50 bg-card px-5 py-4 hover:border-border hover:bg-card/80 transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                  <FolderKanban className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{project.name}</p>
                  {project.client && (
                    <p className="text-xs text-muted-foreground mt-0.5">{project.client}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    {project._count.posts}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Paperclip className="h-3.5 w-3.5" />
                    {project._count.assets}
                  </span>
                  {project.deadline && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(project.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[project.status] ?? STATUS_STYLES.active}`}>
                  {STATUS_LABELS[project.status] ?? project.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
