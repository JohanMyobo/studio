"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2, Save } from "lucide-react";
import { updateEntityVoice } from "@/lib/actions/entities";

type VoiceData = {
  style: string;
  avoid: string;
  examples: string;
};

function parseVoice(raw: string | null): VoiceData {
  if (!raw) return { style: "", avoid: "", examples: "" };
  try {
    return JSON.parse(raw);
  } catch {
    return { style: raw, avoid: "", examples: "" };
  }
}

export function VoiceEditor({ entityId, voiceRaw }: { entityId: string; voiceRaw: string | null }) {
  const [voice, setVoice] = useState<VoiceData>(parseVoice(voiceRaw));
  const [saving, startSave] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startSave(async () => {
      await updateEntityVoice(entityId, JSON.stringify(voice));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card p-6">
      <div className="mb-5 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-400" />
        <h2 className="text-sm font-semibold">Voix & Style IA</h2>
      </div>
      <p className="mb-5 text-xs text-muted-foreground">
        Ces informations sont injectées dans chaque génération IA pour coller à ton style.
      </p>

      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Mon style d&apos;écriture</label>
          <p className="mb-2 text-xs text-muted-foreground">
            Décris comment tu écris — ton, structure, longueur, personnalité
          </p>
          <textarea
            value={voice.style}
            onChange={(e) => setVoice((v) => ({ ...v, style: e.target.value }))}
            rows={3}
            placeholder="Ex : concis et direct, première personne, phrases courtes, humour sobre, jamais de jargon marketing, je parle à des builders comme moi"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground/20 placeholder:text-muted-foreground resize-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Expressions à bannir</label>
          <p className="mb-2 text-xs text-muted-foreground">
            Mots ou formules que tu ne veux jamais voir dans tes posts
          </p>
          <textarea
            value={voice.avoid}
            onChange={(e) => setVoice((v) => ({ ...v, avoid: e.target.value }))}
            rows={2}
            placeholder="Ex : zéro prise de tête, des infos qui claquent, game-changer, révolutionnaire, incontournable, n&apos;hésitez pas à…"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground/20 placeholder:text-muted-foreground resize-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Exemple de post que j&apos;aime</label>
          <p className="mb-2 text-xs text-muted-foreground">
            Colle un post (le tien ou une inspiration) — le modèle s&apos;en inspirera pour le ton
          </p>
          <textarea
            value={voice.examples}
            onChange={(e) => setVoice((v) => ({ ...v, examples: e.target.value }))}
            rows={5}
            placeholder="Colle ici un ou deux posts qui représentent bien ce que tu veux…"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground/20 placeholder:text-muted-foreground resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
            saved
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-violet-500/20 text-violet-300 hover:bg-violet-500/30"
          }`}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved ? "Sauvegardé !" : saving ? "Sauvegarde…" : "Enregistrer la voix"}
        </button>
      </div>
    </div>
  );
}
