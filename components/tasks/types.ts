export type SubTask = {
  id: string;
  title: string;
  done: boolean;
  order: number;
};

export type Task = {
  id: string;
  title: string;
  notes: string | null;
  status: string;
  priority: string;
  label: string | null;
  deadline: Date | null;
  order: number;
  projectId: string;
  phaseId: string | null;
  phase: { id: string; name: string; color: string } | null;
  subTasks: SubTask[];
};

export type Phase = {
  id: string;
  name: string;
  color: string;
  order: number;
};

export const STATUSES = [
  { value: "todo",        label: "À faire",      color: "bg-zinc-500/20 text-zinc-400 dark:text-zinc-400" },
  { value: "in-progress", label: "En cours",     color: "bg-blue-500/20 text-blue-600 dark:text-blue-400" },
  { value: "in-review",   label: "En review",    color: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" },
  { value: "done",        label: "Terminé",      color: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" },
  { value: "cancelled",   label: "Annulé",       color: "bg-red-500/10 text-red-500/60" },
] as const;

export const PRIORITIES = [
  { value: "low",    label: "Faible",  icon: "▽", color: "text-zinc-400" },
  { value: "medium", label: "Moyen",   icon: "△", color: "text-blue-400" },
  { value: "high",   label: "Élevé",   icon: "▲", color: "text-orange-400" },
  { value: "urgent", label: "Urgent",  icon: "⚡", color: "text-red-400" },
] as const;

export function getStatus(value: string) {
  return STATUSES.find((s) => s.value === value) ?? STATUSES[0];
}

export function getPriority(value: string) {
  return PRIORITIES.find((p) => p.value === value) ?? PRIORITIES[1];
}
