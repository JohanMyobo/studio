"use client";

import { useState, useRef } from "react";
import { X, Plus, Trash2, Check, Calendar, Flag, Tag } from "lucide-react";
import { Task, Phase, STATUSES, PRIORITIES, getStatus, getPriority } from "./types";
import {
  updateTask, deleteTask,
  createSubTask, toggleSubTask, deleteSubTask,
} from "@/lib/actions/tasks";
import { cn } from "@/lib/utils";

type Props = {
  task: Task;
  phases: Phase[];
  onClose: () => void;
  onDeleted: (id: string) => void;
  onUpdated: (task: Task) => void;
};

export function TaskDetail({ task: initial, phases, onClose, onDeleted, onUpdated }: Props) {
  const [task, setTask] = useState(initial);
  const [newSub, setNewSub] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes ?? "");
  const titleRef = useRef<HTMLInputElement>(null);

  async function handleUpdateField<K extends keyof Task>(field: K, value: Task[K]) {
    const updated = { ...task, [field]: value };
    setTask(updated as Task);
    onUpdated(updated as Task);
    await updateTask(task.id, { [field]: value } as any);
  }

  async function handleTitleSave() {
    setEditingTitle(false);
    if (title.trim() && title !== task.title) {
      await handleUpdateField("title", title.trim());
    }
  }

  async function handleNotesSave() {
    if (notes !== task.notes) {
      await handleUpdateField("notes", notes || null);
    }
  }

  async function handleAddSubTask() {
    if (!newSub.trim()) return;
    const optimistic = {
      id: `temp-${Date.now()}`,
      title: newSub.trim(),
      done: false,
      order: task.subTasks.length,
    };
    setTask((t) => ({ ...t, subTasks: [...t.subTasks, optimistic] }));
    setNewSub("");
    await createSubTask(task.id, newSub.trim());
  }

  async function handleToggleSub(id: string, done: boolean) {
    setTask((t) => ({
      ...t,
      subTasks: t.subTasks.map((s) => (s.id === id ? { ...s, done: !done } : s)),
    }));
    await toggleSubTask(id, !done);
  }

  async function handleDeleteSub(id: string) {
    setTask((t) => ({ ...t, subTasks: t.subTasks.filter((s) => s.id !== id) }));
    await deleteSubTask(id);
  }

  async function handleDelete() {
    onDeleted(task.id);
    onClose();
    await deleteTask(task.id);
  }

  const status = getStatus(task.status);
  const priority = getPriority(task.priority);
  const doneCount = task.subTasks.filter((s) => s.done).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="relative flex h-full w-full max-w-lg flex-col bg-card border-l border-border shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border px-6 py-4">
          <div className="flex-1 min-w-0">
            {editingTitle ? (
              <input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
                className="w-full bg-transparent text-base font-semibold outline-none border-b border-border pb-0.5"
                autoFocus
              />
            ) : (
              <h2
                className="text-base font-semibold cursor-text hover:opacity-70 transition-opacity"
                onClick={() => setEditingTitle(true)}
              >
                {task.title}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleDelete}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 px-6 py-5 space-y-6">
          {/* Meta fields */}
          <div className="grid grid-cols-2 gap-3">
            {/* Status */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</p>
              <select
                value={task.status}
                onChange={(e) => handleUpdateField("status", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs outline-none"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Priorité</p>
              <select
                value={task.priority}
                onChange={(e) => handleUpdateField("priority", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs outline-none"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.icon} {p.label}</option>
                ))}
              </select>
            </div>

            {/* Phase */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Phase</p>
              <select
                value={task.phaseId ?? ""}
                onChange={(e) => handleUpdateField("phaseId", e.target.value || null)}
                className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs outline-none"
              >
                <option value="">Aucune</option>
                {phases.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Deadline */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Deadline</p>
              <input
                type="date"
                value={task.deadline ? new Date(task.deadline).toISOString().split("T")[0] : ""}
                onChange={(e) =>
                  handleUpdateField("deadline", e.target.value ? new Date(e.target.value) : null)
                }
                className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Label */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Label</p>
            <input
              placeholder="design, bug, feature…"
              value={task.label ?? ""}
              onChange={(e) => handleUpdateField("label", e.target.value || null)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Notes */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesSave}
              placeholder="Ajoute des détails, contexte, liens…"
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* SubTasks */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Sous-tâches {task.subTasks.length > 0 && `(${doneCount}/${task.subTasks.length})`}
              </p>
            </div>

            {task.subTasks.length > 0 && (
              <div className="mb-2 space-y-1">
                {task.subTasks.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-2.5 group rounded-lg px-2 py-1.5 hover:bg-accent/50 transition-colors">
                    <button
                      onClick={() => handleToggleSub(sub.id, sub.done)}
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                        sub.done
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-border hover:border-foreground/30"
                      )}
                    >
                      {sub.done && <Check className="h-2.5 w-2.5" />}
                    </button>
                    <span className={cn("flex-1 text-sm", sub.done && "line-through text-muted-foreground")}>
                      {sub.title}
                    </span>
                    <button
                      onClick={() => handleDeleteSub(sub.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                value={newSub}
                onChange={(e) => setNewSub(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSubTask()}
                placeholder="Ajouter une sous-tâche…"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={handleAddSubTask}
                disabled={!newSub.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
