import { createEntity } from "@/lib/actions/entities";
import { Zap } from "lucide-react";

const ENTITY_TYPES = [
  { value: "agency-nocode", label: "Agence No-Code", emoji: "🔧" },
  { value: "agency-design", label: "Agence Design", emoji: "🎨" },
  { value: "youtube", label: "Chaîne YouTube", emoji: "🎬" },
  { value: "freelance", label: "Freelance", emoji: "💼" },
  { value: "saas", label: "SaaS / Produit", emoji: "🚀" },
  { value: "other", label: "Autre", emoji: "⚡" },
];

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f97316",
  "#10b981", "#06b6d4", "#3b82f6", "#eab308",
];

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
            <Zap className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Crée ta première entité
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Une entité regroupe tes projets, posts et contacts.<br />
            Tu pourras en créer d&apos;autres plus tard.
          </p>
        </div>

        <form action={createEntity} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Nom</label>
            <input
              name="name"
              required
              placeholder="Agence No-Code, Studio Design…"
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {ENTITY_TYPES.map((t) => (
                <label
                  key={t.value}
                  className="relative flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-3 text-center text-xs hover:border-white/20 transition-colors has-[input:checked]:border-white/40 has-[input:checked]:bg-white/5"
                >
                  <input
                    type="radio"
                    name="type"
                    value={t.value}
                    className="sr-only"
                    defaultChecked={t.value === "other"}
                  />
                  <span className="text-xl">{t.emoji}</span>
                  <span>{t.label}</span>
                  <input type="hidden" name={`emoji_${t.value}`} value={t.emoji} />
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Couleur</label>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <label key={color} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="color"
                    value={color}
                    className="peer sr-only"
                    defaultChecked={color === "#6366f1"}
                  />
                  <span
                    className="block h-7 w-7 rounded-full transition-all outline outline-2 outline-transparent outline-offset-2 peer-checked:outline-white"
                    style={{ backgroundColor: color }}
                  />
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90 transition-colors"
          >
            Créer et accéder au Dashboard →
          </button>
        </form>
      </div>
    </div>
  );
}
