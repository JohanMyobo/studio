"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { switchEntity } from "@/lib/actions/entities";
import { useRouter } from "next/navigation";

type Entity = {
  id: string;
  name: string;
  emoji: string;
  color: string;
};

type Props = {
  entities: Entity[];
  currentId: string | null;
};

export function EntitySwitcher({ entities, currentId }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const current = entities.find((e) => e.id === currentId) ?? entities[0];

  async function handleSwitch(id: string) {
    setOpen(false);
    await switchEntity(id);
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-base leading-none">{current?.emoji ?? "⚡"}</span>
          <span className="text-sm font-medium truncate">{current?.name ?? "Studio"}</span>
        </div>
        <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-border bg-card shadow-xl">
            <div className="p-1">
              {entities.map((entity) => (
                <button
                  key={entity.id}
                  onClick={() => handleSwitch(entity.id)}
                  className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm hover:bg-white/5 transition-colors"
                >
                  <span>{entity.emoji}</span>
                  <span className="flex-1 text-left truncate">{entity.name}</span>
                  {entity.id === currentId && (
                    <Check className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
            <div className="border-t border-border p-1">
              <button
                onClick={() => { setOpen(false); router.push("/onboarding"); }}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Nouvelle entité
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
