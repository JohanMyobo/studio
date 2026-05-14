"use client";

import { useState } from "react";
import { GripVertical, ChevronRight, Calendar, Check } from "lucide-react";
import { Task, getStatus, getPriority } from "./types";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  task: Task;
  onOpen: (task: Task) => void;
  onToggleDone?: (task: Task) => void;
};

export function TaskRow({ task, onOpen, onToggleDone }: Props) {
  const status = getStatus(task.status);
  const priority = getPriority(task.priority);
  const isDone = task.status === "done";
  const doneSubs = task.subTasks.filter((s) => s.done).length;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-accent/40 transition-colors",
        isDragging && "opacity-50"
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity touch-none"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Done toggle */}
      <button
        onClick={() => onToggleDone?.(task)}
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
          isDone
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-border hover:border-foreground/40"
        )}
      >
        {isDone && <Check className="h-2.5 w-2.5" />}
      </button>

      {/* Title + meta */}
      <button
        className="flex flex-1 items-center gap-3 text-left min-w-0"
        onClick={() => onOpen(task)}
      >
        <span className={cn("flex-1 truncate text-sm", isDone && "line-through text-muted-foreground")}>
          {task.title}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          {/* Priority icon */}
          <span className={cn("text-xs", priority.color)}>{priority.icon}</span>

          {/* Phase */}
          {task.phase && (
            <span
              className="rounded px-1.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: task.phase.color + "22", color: task.phase.color }}
            >
              {task.phase.name}
            </span>
          )}

          {/* Deadline */}
          {task.deadline && (
            <span className={cn(
              "flex items-center gap-1 text-xs",
              new Date(task.deadline) < new Date() && !isDone
                ? "text-red-400"
                : "text-muted-foreground"
            )}>
              <Calendar className="h-3 w-3" />
              {new Date(task.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </span>
          )}

          {/* Subtasks progress */}
          {task.subTasks.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {doneSubs}/{task.subTasks.length}
            </span>
          )}

          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </button>
    </div>
  );
}
