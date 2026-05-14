"use client";

import { useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { Task, Phase, STATUSES, getStatus } from "./types";
import { TaskRow } from "./task-row";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { updateTask, createTask, reorderTasks } from "@/lib/actions/tasks";

type Props = {
  tasks: Task[];
  phases: Phase[];
  projectId: string;
  onTasksChange: (tasks: Task[]) => void;
  onOpen: (task: Task) => void;
};

export function TaskList({ tasks, phases, projectId, onTasksChange, onOpen }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    cancelled: true,
  });
  const [quickAdd, setQuickAdd] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const grouped = STATUSES.map((s) => ({
    status: s,
    tasks: tasks.filter((t) => t.status === s.value),
  }));

  async function handleToggleDone(task: Task) {
    const newStatus = task.status === "done" ? "todo" : "done";
    onTasksChange(tasks.map((t) => t.id === task.id ? { ...t, status: newStatus } : t));
    await updateTask(task.id, { status: newStatus });
  }

  async function handleQuickAdd(statusValue: string) {
    const title = quickAdd[statusValue]?.trim();
    if (!title) return;
    const optimistic: Task = {
      id: `temp-${Date.now()}`,
      title,
      notes: null,
      status: statusValue,
      priority: "medium",
      label: null,
      deadline: null,
      order: tasks.filter((t) => t.status === statusValue).length,
      projectId,
      phaseId: null,
      phase: null,
      subTasks: [],
    };
    onTasksChange([...tasks, optimistic]);
    setQuickAdd((q) => ({ ...q, [statusValue]: "" }));
    setAdding(null);

    const fd = new FormData();
    fd.append("projectId", projectId);
    fd.append("title", title);
    fd.append("status", statusValue);
    await createTask(fd);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newTasks = [...tasks];
    const [moved] = newTasks.splice(oldIndex, 1);
    newTasks.splice(newIndex, 0, moved);
    const reordered = newTasks.map((t, i) => ({ ...t, order: i }));
    onTasksChange(reordered);

    await reorderTasks(
      reordered.map((t) => ({ id: t.id, order: t.order, status: t.status }))
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-1">
        {grouped.map(({ status, tasks: statusTasks }) => (
          <div key={status.value}>
            {/* Status header */}
            <button
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-accent/30 transition-colors"
              onClick={() =>
                setCollapsed((c) => ({ ...c, [status.value]: !c[status.value] }))
              }
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground transition-transform",
                  collapsed[status.value] && "-rotate-90"
                )}
              />
              <span className={cn("rounded px-1.5 py-0.5 text-xs font-medium", status.color)}>
                {status.label}
              </span>
              <span className="text-xs text-muted-foreground">{statusTasks.length}</span>
            </button>

            {/* Tasks */}
            {!collapsed[status.value] && (
              <div className="ml-4">
                <SortableContext
                  items={statusTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {statusTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onOpen={onOpen}
                      onToggleDone={handleToggleDone}
                    />
                  ))}
                </SortableContext>

                {/* Quick add row */}
                {adding === status.value ? (
                  <div className="flex items-center gap-2 pl-8 pr-2 py-1">
                    <input
                      autoFocus
                      value={quickAdd[status.value] ?? ""}
                      onChange={(e) =>
                        setQuickAdd((q) => ({ ...q, [status.value]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleQuickAdd(status.value);
                        if (e.key === "Escape") setAdding(null);
                      }}
                      onBlur={() => {
                        if (!quickAdd[status.value]?.trim()) setAdding(null);
                      }}
                      placeholder="Nom de la tâche…"
                      className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <button
                      onClick={() => handleQuickAdd(status.value)}
                      className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAdding(status.value)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 pl-8 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter une tâche
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </DndContext>
  );
}
