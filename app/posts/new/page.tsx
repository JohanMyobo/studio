import { createPost } from "@/lib/actions/posts";
import { getProjects } from "@/lib/actions/projects";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const PLATFORMS = [
  { value: "linkedin", label: "LinkedIn", emoji: "💼" },
  { value: "twitter", label: "Twitter / X", emoji: "🐦" },
  { value: "instagram", label: "Instagram", emoji: "📸" },
  { value: "facebook", label: "Facebook", emoji: "👤" },
  { value: "tiktok", label: "TikTok", emoji: "🎵" },
];

const TONES = [
  { value: "professional", label: "Professionnel" },
  { value: "casual", label: "Décontracté" },
  { value: "storytelling", label: "Storytelling" },
  { value: "educational", label: "Éducatif" },
  { value: "promotional", label: "Promotionnel" },
];

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { projectId } = await searchParams;
  const projects = await getProjects();

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/posts"
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux posts
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Nouveau post</h1>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card p-8 text-center max-w-md">
          <p className="text-sm font-medium">Aucun projet disponible</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Crée d&apos;abord un projet pour y associer des posts
          </p>
          <Link
            href="/projects/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 text-sm font-medium hover:bg-white/15 transition-colors"
          >
            Créer un projet
          </Link>
        </div>
      ) : (
        <div className="max-w-xl">
          <form action={createPost} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Titre <span className="text-red-400">*</span>
              </label>
              <input
                name="title"
                required
                placeholder="Titre ou sujet du post…"
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-white/20 placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Projet <span className="text-red-400">*</span>
              </label>
              <select
                name="projectId"
                required
                defaultValue={projectId ?? ""}
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-white/20 text-foreground"
              >
                <option value="" disabled>Sélectionner un projet…</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Plateforme <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {PLATFORMS.map((p) => (
                  <label
                    key={p.value}
                    className="relative flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-3 text-center hover:border-white/20 transition-colors has-[input:checked]:border-white/40 has-[input:checked]:bg-white/5"
                  >
                    <input type="radio" name="platform" value={p.value} className="sr-only" required />
                    <span className="text-xl">{p.emoji}</span>
                    <span className="text-xs">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Ton</label>
                <select
                  name="tone"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-white/20 text-foreground"
                >
                  <option value="">Sélectionner…</option>
                  {TONES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Statut</label>
                <select
                  name="status"
                  defaultValue="draft"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-white/20 text-foreground"
                >
                  <option value="draft">Brouillon</option>
                  <option value="scheduled">Planifié</option>
                  <option value="published">Publié</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Date de publication</label>
              <input
                name="scheduledAt"
                type="datetime-local"
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-white/20 text-foreground [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Contenu</label>
              <textarea
                name="content"
                rows={6}
                placeholder="Optionnel — tu pourras générer le contenu avec l'IA après création"
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-white/20 placeholder:text-muted-foreground resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90 transition-colors"
              >
                Créer le post
              </button>
              <Link
                href="/posts"
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
