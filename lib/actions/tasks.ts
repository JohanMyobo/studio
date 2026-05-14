"use server";

import { supabase } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";

// ── Tasks ──────────────────────────────────────────────

export async function createTask(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const title = formData.get("title") as string;
  if (!projectId || !title?.trim()) return;

  await supabase.from("tasks").insert({
    title: title.trim(),
    project_id: projectId,
    status: (formData.get("status") as string) || "todo",
    priority: (formData.get("priority") as string) || "medium",
    phase_id: (formData.get("phaseId") as string) || null,
    label: (formData.get("label") as string) || null,
    deadline: (formData.get("deadline") as string) || null,
    notes: (formData.get("notes") as string) || null,
    order: 0,
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
  const { phaseId, deadline, ...rest } = data as any;
  const payload: any = { ...rest };
  if (phaseId !== undefined) payload.phase_id = phaseId;
  if (deadline !== undefined) payload.deadline = deadline ? new Date(deadline).toISOString() : null;

  const { data: task } = await supabase
    .from("tasks")
    .update(payload)
    .eq("id", id)
    .select("project_id")
    .single();

  if (task) revalidatePath(`/projects/${task.project_id}`);
}

export async function deleteTask(id: string) {
  const { data: task } = await supabase
    .from("tasks")
    .select("project_id")
    .eq("id", id)
    .single();

  await supabase.from("tasks").delete().eq("id", id);
  if (task) revalidatePath(`/projects/${task.project_id}`);
}

export async function reorderTasks(
  tasks: { id: string; order: number; status: string }[]
) {
  await Promise.all(
    tasks.map(({ id, order, status }) =>
      supabase.from("tasks").update({ order, status }).eq("id", id)
    )
  );
}

export async function getTasksForProject(projectId: string) {
  const { data } = await supabase
    .from("tasks")
    .select("*, sub_tasks(*), phase:phases(*)")
    .eq("project_id", projectId)
    .order("order", { ascending: true });

  return (data ?? []).map((t: any) => ({
    ...t,
    subTasks: t.sub_tasks ?? [],
    phaseId: t.phase_id,
  }));
}

// ── SubTasks ────────────────────────────────────────────

export async function createSubTask(taskId: string, title: string) {
  await supabase.from("sub_tasks").insert({
    title,
    task_id: taskId,
    done: false,
    order: 0,
  });
}

export async function toggleSubTask(id: string, done: boolean) {
  await supabase.from("sub_tasks").update({ done }).eq("id", id);
}

export async function deleteSubTask(id: string) {
  await supabase.from("sub_tasks").delete().eq("id", id);
}

// ── Phases ─────────────────────────────────────────────

export async function createPhase(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const name = formData.get("name") as string;
  if (!projectId || !name?.trim()) return;

  await supabase.from("phases").insert({
    name: name.trim(),
    color: (formData.get("color") as string) || "#6366f1",
    project_id: projectId,
    order: 0,
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function getPhasesForProject(projectId: string) {
  const { data } = await supabase
    .from("phases")
    .select("*")
    .eq("project_id", projectId)
    .order("order", { ascending: true });
  return data ?? [];
}
