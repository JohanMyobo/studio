"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, Loader2, Save, Trash2, ExternalLink,
  ThumbsUp, Eye, MessageCircle, Share2, FileText, Image, File, Check,
} from "lucide-react";
import { updatePost, deletePost } from "@/lib/actions/posts";
import { generatePostContent } from "@/lib/actions/ai";
import { cn } from "@/lib/utils";

const PLATFORM_EMOJIS: Record<string, string> = {
  linkedin: "💼", twitter: "🐦", instagram: "📸", facebook: "👤", tiktok: "🎵",
};
const STATUS_STYLES: Record<string, string> = {
  draft: "bg-zinc-500/20 text-zinc-400",
  scheduled: "bg-yellow-500/20 text-yellow-400",
  published: "bg-emerald-500/20 text-emerald-400",
  archived: "bg-zinc-500/10 text-zinc-500",
};
const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon", scheduled: "Planifié", published: "Publié", archived: "Archivé",
};
const STATUSES = ["draft", "scheduled", "published", "archived"];
const TONES = [
  { value: "professional", label: "Professionnel" },
  { value: "casual", label: "Décontracté" },
  { value: "storytelling", label: "Storytelling" },
  { value: "educational", label: "Éducatif" },
  { value: "promotional", label: "Promotionnel" },
];

const ASSET_ICONS: Record<string, React.ElementType> = {
  image: Image,
  pdf: FileText,
  doc: FileText,
  text: FileText,
};

type Asset = {
  id: string;
  name: string;
  type: string;
  url: string;
  size?: number | null;
};

type Post = {
  id: string;
  title: string;
  content: string | null;
  platform: string;
  tone: string | null;
  status: string;
  scheduled_at: string | null;
  likes: number | null;
  views: number | null;
  comments: number | null;
  shares: number | null;
  project: {
    id: string;
    name: string;
    description: string | null;
    assets: Asset[];
  };
};

export function PostEditor({ post: initial }: { post: Post }) {
  const router = useRouter();
  const [post, setPost] = useState(initial);
  const [content, setContent] = useState(initial.content ?? "");
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
  const [saving, startSave] = useTransition();
  const [generating, startGenerate] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saved, setSaved] = useState(false);

  const assets = post.project?.assets ?? [];

  function toggleAsset(id: string) {
    setSelectedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleFieldChange(field: string, value: any) {
    setPost((p) => ({ ...p, [field]: value }));
  }

  function handleSave() {
    startSave(async () => {
      await updatePost(post.id, {
        title: post.title,
        content: content || null,
        status: post.status,
        tone: post.tone,
        scheduledAt: post.scheduled_at,
        likes: post.likes ?? undefined,
        views: post.views ?? undefined,
        comments: post.comments ?? undefined,
        shares: post.shares ?? undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  function handleGenerate() {
    startGenerate(async () => {
      const selected = assets.filter((a) => selectedAssetIds.has(a.id));
      const generated = await generatePostContent({
        title: post.title,
        platform: post.platform,
        tone: post.tone,
        projectName: post.project.name,
        projectDescription: post.project.description,
        assets: assets.map((a) => ({ name: a.name, type: a.type })),
        selectedAssets: selected.length > 0 ? selected : undefined,
        userPrompt: aiPrompt || undefined,
      });
      setContent(generated);
      setShowAiPrompt(false);
      setAiPrompt("");
    });
  }

  function handleDelete() {
    startDelete(async () => {
      await deletePost(post.id);
    });
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Main — editor */}
      <div className="col-span-2 space-y-4">
        {/* Title */}
        <input
          value={post.title}
          onChange={(e) => handleFieldChange("title", e.target.value)}
          className="w-full bg-transparent text-2xl font-semibold outline-none placeholder:text-muted-foreground"
          placeholder="Titre du post…"
        />

        {/* AI generation */}
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-300">Générer avec l&apos;IA</span>
            </div>
            <button
              onClick={() => setShowAiPrompt((s) => !s)}
              className="text-xs text-violet-400/70 hover:text-violet-300 transition-colors"
            >
              {showAiPrompt ? "Masquer" : "Instructions"}
            </button>
          </div>

          {/* Asset selector */}
          {assets.length > 0 && (
            <div className="mb-3">
              <p className="mb-1.5 text-xs text-muted-foreground">
                Utiliser un asset comme contexte :
              </p>
              <div className="flex flex-wrap gap-2">
                {assets.map((asset) => {
                  const Icon = ASSET_ICONS[asset.type] ?? File;
                  const selected = selectedAssetIds.has(asset.id);
                  return (
                    <button
                      key={asset.id}
                      onClick={() => toggleAsset(asset.id)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-all",
                        selected
                          ? "border-violet-500/60 bg-violet-500/20 text-violet-300"
                          : "border-border/50 bg-background/50 text-muted-foreground hover:border-violet-500/30 hover:text-foreground"
                      )}
                    >
                      {selected ? (
                        <Check className="h-3 w-3 shrink-0" />
                      ) : (
                        <Icon className="h-3 w-3 shrink-0" />
                      )}
                      <span className="max-w-[140px] truncate">{asset.name}</span>
                    </button>
                  );
                })}
              </div>
              {selectedAssetIds.size > 0 && (
                <p className="mt-1.5 text-xs text-violet-400/70">
                  {selectedAssetIds.size} asset{selectedAssetIds.size > 1 ? "s" : ""} sélectionné{selectedAssetIds.size > 1 ? "s" : ""} · le contenu sera transmis à l&apos;IA
                </p>
              )}
            </div>
          )}

          {showAiPrompt && (
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Instructions spécifiques… ex: focus sur les résultats, mentionne la deadline, utilise des chiffres"
              rows={2}
              className="mb-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground resize-none"
            />
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 rounded-lg bg-violet-500/20 px-3.5 py-2 text-sm font-medium text-violet-300 hover:bg-violet-500/30 transition-colors disabled:opacity-60"
          >
            {generating ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Génération en cours…</>
            ) : (
              <><Sparkles className="h-3.5 w-3.5" /> Générer le contenu</>
            )}
          </button>
        </div>

        {/* Content editor */}
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Contenu</p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Rédige ou génère ton contenu ici…"
            rows={14}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground resize-none leading-relaxed"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{content.length} caractères</span>
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                saved
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-accent text-foreground hover:bg-accent/80"
              )}
            >
              {saving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3" />
              )}
              {saved ? "Sauvegardé !" : saving ? "Sauvegarde…" : "Sauvegarder"}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Meta */}
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Infos</h3>
          <div className="space-y-3">
            {/* Platform */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Plateforme</span>
              <span className="text-sm font-medium">
                {PLATFORM_EMOJIS[post.platform]} {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Statut</span>
              <select
                value={post.status}
                onChange={(e) => handleFieldChange("status", e.target.value)}
                className="rounded-full px-2.5 py-0.5 text-xs font-medium outline-none cursor-pointer bg-transparent border border-border"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>

            {/* Tone */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Ton</span>
              <select
                value={post.tone ?? ""}
                onChange={(e) => handleFieldChange("tone", e.target.value || null)}
                className="text-xs font-medium outline-none cursor-pointer bg-transparent text-right border-0"
              >
                <option value="">—</option>
                {TONES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Scheduled */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Publication</span>
              <input
                type="datetime-local"
                value={post.scheduled_at ? new Date(post.scheduled_at).toISOString().slice(0, 16) : ""}
                onChange={(e) => handleFieldChange("scheduled_at", e.target.value || null)}
                className="text-xs outline-none bg-transparent [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>

            {/* Project */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Projet</span>
              <a
                href={`/projects/${post.project.id}`}
                className="flex items-center gap-1 text-xs font-medium hover:underline"
              >
                {post.project.name}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Performance</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "likes", icon: ThumbsUp, label: "Likes" },
              { key: "views", icon: Eye, label: "Vues" },
              { key: "comments", icon: MessageCircle, label: "Commentaires" },
              { key: "shares", icon: Share2, label: "Partages" },
            ].map(({ key, icon: Icon, label }) => (
              <div key={key} className="rounded-lg bg-muted/50 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="h-3 w-3" />
                  {label}
                </div>
                <input
                  type="number"
                  min="0"
                  value={(post as any)[key] ?? ""}
                  onChange={(e) => handleFieldChange(key, e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="—"
                  className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-muted-foreground/50"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Delete */}
        <div className="rounded-xl border border-border/50 bg-card p-4">
          {confirmDelete ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Supprimer ce post définitivement ?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/25 transition-colors"
                >
                  {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  Confirmer
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Supprimer le post
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
