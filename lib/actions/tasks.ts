"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ── Tasks ──────────────────────────────────────────────

export async function createTask(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const title = formData.get("title") as string;
  if (!projectId || !title?.trim()) return;

  const count = await prisma.task.count({ where: { projectId } });

  await prisma.task.create({
    data: {
      title: title.trim(),
      projectId,
      status: (formData.get("status") as string) || "todo",
      priority: (formData.get("priority") as string) || "medium",
      phaseId: (formData.get("phaseId") as string) || null,
      label: (formData.get("label") as string) || null,
      deadline: formData.get("deadline")
        ? new Date(formData.get("deadline") as string)
        : null,
      notes: (formData.get("notes") as string) || null,
      order: count,
    },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function updateTask(
  id: string,
  data: Partial<{
    title: string;
    notes: string | null;
    status: string;
    priority: string;
    label: string | null;
    deadline: Date | null;
    phaseId: string | null;
    order: number;
  }>
) {
  const task = await prisma.task.update({ where: { id }, data });
  revalidatePath(`/projects/${task.projectId}`);
}

export async function deleteTask(id: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  await prisma.task.delete({ where: { id } });
  if (task) revalidatePath(`/projects/${task.projectId}`);
}

export async function reorderTasks(
  tasks: { id: string; order: number; status: string }[]
) {
  await Promise.all(
    tasks.map(({ id, order, status }) =>
      prisma.task.update({ where: { id }, data: { order, status } })
    )
  );
}

export async function getTasksForProject(projectId: string) {
  return prisma.task.findMany({
    where: { projectId },
    include: {
      subTasks: { orderBy: { order: "asc" } },
      phase: true,
    },
    orderBy: { order: "asc" },
  });
}

// ── SubTasks ────────────────────────────────────────────

export async function createSubTask(taskId: string, title: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  const count = await prisma.subTask.count({ where: { taskId } });

  await prisma.subTask.create({
    data: { title, taskId, order: count },
  });

  if (task) revalidatePath(`/projects/${task.projectId}`);
}

export async function toggleSubTask(id: string, done: boolean) {
  await prisma.subTask.update({ where: { id }, data: { done } });
}

export async function deleteSubTask(id: string) {
  await prisma.subTask.delete({ where: { id } });
}

// ── Phases ─────────────────────────────────────────────

export async function createPhase(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const name = formData.get("name") as string;
  if (!projectId || !name?.trim()) return;

  const count = await prisma.phase.count({ where: { projectId } });
  await prisma.phase.create({
    data: {
      name: name.trim(),
      color: (formData.get("color") as string) || "#6366f1",
      projectId,
      order: count,
    },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function getPhasesForProject(projectId: string) {
  return prisma.phase.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
  });
}
