import { createProject } from "@/lib/actions/projects";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const PROJECT_TYPES = [
  "Site web", "Application mobile", "Branding", "Marketing",
  "Consulting", "Développement", "Design", "Contenu", "Autre",
];

export default function NewProjectPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/projects"
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux projets
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Nouveau projet</h1>
      </div>

      <div className="max-w-xl">
        <form action={createProject} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Nom du projet <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              required
              placeholder="Refonte site XYZ, App mobile ABC…"
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-white/20 placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Client</label>
              <input
                name="client"
                placeholder="Nom du client"
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-white/20 placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Type</label>
              <select
                name="type"
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-white/20 text-foreground"
              >
                <option value="">Sélectionner…</option>
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Statut</label>
              <select
                name="status"
                defaultValue="active"
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-white/20 text-foreground"
              >
                <option value="active">Actif</option>
                <option value="paused">En pause</option>
                <option value="completed">Terminé</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Deadline</label>
              <input
                name="deadline"
                type="date"
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-white/20 text-foreground [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Contexte, objectifs, notes importantes…"
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-white/20 placeholder:text-muted-foreground resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90 transition-colors"
            >
              Créer le projet
            </button>
            <Link
              href="/projects"
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
