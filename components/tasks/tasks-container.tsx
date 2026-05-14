"use client";

import { useState } from "react";
import { LayoutList, Kanban, Plus } from "lucide-react";
import { Task, Phase } from "./types";
import { TaskList } from "./task-list";
import { TaskBoard } from "./task-board";
import { TaskDetail } from "./task-detail";
import { cn } from "@/lib/utils";

type View = "list" | "board";

type Props = {
  initialTasks: Task[];
  phases: Phase[];
  projectId: string;
};

export function TasksContainer({ initialTasks, phases, projectId }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<Task | null>(null);

  function handleTaskUpdated(updated: Task) {
    setTasks((ts) => ts.map((t) => (t.id === updated.id ? updated : t)));
    if (selected?.id === updated.id) setSelected(updated);
  }

  function handleTaskDeleted(id: string) {
    setTasks((ts) => ts.filter((t) => t.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <button
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              view === "list"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutList className="h-3.5 w-3.5" />
            Liste
          </button>
          <button
            onClick={() => setView("board")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              view === "board"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Kanban className="h-3.5 w-3.5" />
            Board
          </button>
        </div>

        <span className="text-xs text-muted-foreground">
          {tasks.filter((t) => t.status === "done").length}/{tasks.length} terminées
        </span>
      </div>

      {/* View */}
      {view === "list" ? (
        <TaskList
          tasks={tasks}
          phases={phases}
          projectId={projectId}
          onTasksChange={setTasks}
          onOpen={setSelected}
        />
      ) : (
        <TaskBoard
          tasks={tasks}
          phases={phases}
          projectId={projectId}
          onTasksChange={setTasks}
          onOpen={setSelected}
        />
      )}

      {/* Detail slide-over */}
      {selected && (
        <TaskDetail
          task={selected}
          phases={phases}
          onClose={() => setSelected(null)}
          onDeleted={handleTaskDeleted}
          onUpdated={handleTaskUpdated}
        />
      )}
    </div>
  );
}
