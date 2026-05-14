import { getCurrentEntityId } from "@/lib/entity";
import { getEntity } from "@/lib/actions/entities";
import { updateEntity } from "@/lib/actions/entities";
import { redirect } from "next/navigation";

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

export default async function SettingsPage() {
  const entityId = await getCurrentEntityId();
  if (!entityId) redirect("/onboarding");

  const entity = await getEntity(entityId);
  if (!entity) redirect("/onboarding");

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure ton entité active
        </p>
      </div>

      <div className="max-w-xl space-y-8">
        {/* Entity edit */}
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <h2 className="mb-5 text-sm font-semibold">
            {entity.emoji} Entité — {entity.name}
          </h2>

          <form action={updateEntity} className="space-y-5">
            <input type="hidden" name="id" value={entity.id} />

            <div>
              <label className="mb-1.5 block text-sm font-medium">Nom</label>
              <input
                name="name"
                required
                defaultValue={entity.name}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground/20 placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {ENTITY_TYPES.map((t) => (
                  <label
                    key={t.value}
                    className="relative flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-3 text-center text-xs hover:border-foreground/20 transition-colors has-[input:checked]:border-foreground/40 has-[input:checked]:bg-foreground/5"
                  >
                    <input
                      type="radio"
                      name="type"
                      value={t.value}
                      className="sr-only"
                      defaultChecked={entity.type === t.value}
                    />
                    <span className="text-xl">{t.emoji}</span>
                    <span>{t.label}</span>
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
                      defaultChecked={entity.color === color}
                    />
                    <span
                      className="block h-7 w-7 rounded-full transition-all outline outline-2 outline-transparent outline-offset-2 peer-checked:outline-foreground"
                      style={{ backgroundColor: color }}
                    />
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
            >
              Enregistrer les modifications
            </button>
          </form>
        </div>

        {/* Theme */}
        <div className="rounded-xl border border-border/50 bg-card p-6">
          <h2 className="mb-1 text-sm font-semibold">Apparence</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Bascule entre le mode sombre et le mode clair depuis la sidebar en bas à gauche.
          </p>
          <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-background px-4 py-3 text-sm text-muted-foreground">
            <span>Le toggle est disponible en bas de la sidebar →</span>
          </div>
        </div>

        {/* Coming soon */}
        <div className="rounded-xl border border-border/50 bg-card p-6 opacity-50">
          <h2 className="mb-1 text-sm font-semibold">Authentification</h2>
          <p className="text-xs text-muted-foreground">
            Clerk — brancher les clés dans <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code> pour activer l&apos;auth.
          </p>
        </div>
      </div>
    </div>
  );
}
