"use client";

import { Trash2 } from "lucide-react";
import { deleteProject } from "@/lib/actions/projects";
import { useState } from "react";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const [confirm, setConfirm] = useState(false);

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Confirmer ?</span>
        <button
          onClick={() => deleteProject(projectId)}
          className="rounded-md bg-red-500/15 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/25 transition-colors"
        >
          Supprimer
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Annuler
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Supprimer
    </button>
  );
}
