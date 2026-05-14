import { Users, Plus } from "lucide-react";

export default function CRMPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">CRM</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gère tes prospects, clients et opportunités
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 text-sm font-medium hover:bg-white/15 transition-colors">
          <Plus className="h-4 w-4" />
          Nouveau contact
        </button>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-card py-20 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 mb-4">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">Aucun contact</p>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs">
          Ajoute tes premiers prospects et clients pour tracker ton pipeline commercial
        </p>
      </div>
    </div>
  );
}
