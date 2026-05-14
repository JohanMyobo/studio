"use client";

import { useState } from "react";
import { Plus, GripVertical, Calendar, Check, ChevronRight } from "lucide-react";
import { Task, Phase, STATUSES, getPriority } from "./types";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { updateTask, createTask, reorderTasks } from "@/lib/actions/tasks";

// ── Kanban Card ─────────────────────────────────────────

function KanbanCard({
  task,
  onOpen,
  overlay = false,
}: {
  task: Task;
  onOpen: (task: Task) => void;
  overlay?: boolean;
}) {
  const priority = getPriority(task.priority);
  const doneSubs = task.subTasks.filter((s) => s.done).length;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-lg border border-border bg-background p-3 shadow-sm",
        isDragging && !overlay && "opacity-40",
        overlay && "shadow-xl rotate-1 cursor-grabbing"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity touch-none shrink-0"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <button className="flex-1 text-left" onClick={() => onOpen(task)}>
          <p className="text-sm font-medium leading-snug">{task.title}</p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className={cn("text-xs", priority.color)}>{priority.icon}</span>

            {task.phase && (
              <span
                className="rounded px-1.5 py-0.5 text-xs font-medium"
                style={{ backgroundColor: task.phase.color + "22", color: task.phase.color }}
              >
                {task.phase.name}
              </span>
            )}

            {task.label && (
              <span className="rounded bg-accent px-1.5 py-0.5 text-xs text-muted-foreground">
                {task.label}
              </span>
            )}
          </div>

          {(task.deadline || task.subTasks.length > 0) && (
            <div className="mt-2 flex items-center gap-3">
              {task.deadline && (
                <span className={cn(
                  "flex items-center gap-1 text-xs",
                  new Date(task.deadline) < new Date() && task.status !== "done"
                    ? "text-red-400"
                    : "text-muted-foreground"
                )}>
                  <Calendar className="h-3 w-3" />
                  {new Date(task.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </span>
              )}
              {task.subTasks.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Check className="h-3 w-3" />
                  {doneSubs}/{task.subTasks.length}
                </span>
              )}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Droppable Column ────────────────────────────────────

function KanbanColumn({
  status,
  tasks,
  projectId,
  onOpen,
  onTasksChange,
  allTasks,
}: {
  status: typeof STATUSES[number];
  tasks: Task[];
  projectId: string;
  onOpen: (task: Task) => void;
  onTasksChange: (tasks: Task[]) => void;
  allTasks: Task[];
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [addTitle, setAddTitle] = useState("");

  const { setNodeRef, isOver } = useDroppable({ id: `col-${status.value}` });

  async function handleAdd() {
    const title = addTitle.trim();
    if (!title) return;
    const optimistic: Task = {
      id: `temp-${Date.now()}`,
      title,
      notes: null,
      status: status.value,
      priority: "medium",
      label: null,
      deadline: null,
      order: tasks.length,
      projectId,
      phaseId: null,
      phase: null,
      subTasks: [],
    };
    onTasksChange([...allTasks, optimistic]);
    setAddTitle("");
    setShowAdd(false);

    const fd = new FormData();
    fd.append("projectId", projectId);
    fd.append("title", title);
    fd.append("status", status.value);
    await createTask(fd);
  }

  return (
    <div className="flex w-72 shrink-0 flex-col">
      {/* Column header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("rounded px-2 py-0.5 text-xs font-medium", status.color)}>
            {status.label}
          </span>
          <span className="text-xs text-muted-foreground">{tasks.length}</span>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-2 rounded-xl p-2 transition-colors min-h-[120px]",
          isOver ? "bg-accent/50" : "bg-muted/30"
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} onOpen={onOpen} />
          ))}
        </SortableContext>

        {/* Quick add */}
        {showAdd ? (
          <div className="space-y-2 rounded-lg border border-border bg-background p-2.5">
            <input
              autoFocus
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") { setShowAdd(false); setAddTitle(""); }
              }}
              placeholder="Nom de la tâche…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleAdd}
                className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
              >
                Ajouter
              </button>
              <button
                onClick={() => { setShowAdd(false); setAddTitle(""); }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter
          </button>
        )}
      </div>
    </div>
  );
}

// ── Board ───────────────────────────────────────────────

type Props = {
  tasks: Task[];
  phases: Phase[];
  projectId: string;
  onTasksChange: (tasks: Task[]) => void;
  onOpen: (task: Task) => void;
};

export function TaskBoard({ tasks, phases, projectId, onTasksChange, onOpen }: Props) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const draggedTask = tasks.find((t) => t.id === active.id);
    if (!draggedTask) return;

    let newStatus = draggedTask.status;

    // Dropped on a column droppable
    if (String(over.id).startsWith("col-")) {
      newStatus = String(over.id).replace("col-", "");
    } else {
      // Dropped on another card — use that card's status
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) newStatus = overTask.status;
    }

    // Reorder within same status or move to new column
    let newTasks = tasks.map((t) =>
      t.id === draggedTask.id ? { ...t, status: newStatus } : t
    );

    // Recalculate order per column
    const reordered: Task[] = [];
    STATUSES.forEach((s) => {
      const col = newTasks
        .filter((t) => t.status === s.value)
        .map((t, i) => ({ ...t, order: i }));
      reordered.push(...col);
    });

    onTasksChange(reordered);
    await reorderTasks(reordered.map((t) => ({ id: t.id, order: t.order, status: t.status })));
  }

  async function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const draggedTask = tasks.find((t) => t.id === active.id);
    if (!draggedTask) return;

    let newStatus = draggedTask.status;
    if (String(over.id).startsWith("col-")) {
      newStatus = String(over.id).replace("col-", "");
    } else {
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) newStatus = overTask.status;
    }

    if (newStatus !== draggedTask.status) {
      onTasksChange(
        tasks.map((t) => (t.id === draggedTask.id ? { ...t, status: newStatus } : t))
      );
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status.value}
            status={status}
            tasks={tasks.filter((t) => t.status === status.value)}
            projectId={projectId}
            onOpen={onOpen}
            onTasksChange={onTasksChange}
            allTasks={tasks}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <KanbanCard task={activeTask} onOpen={onOpen} overlay />
        )}
      </DragOverlay>
    </DndContext>
  );
}
