"use server";

import { supabase } from "@/lib/supabase/client";
import { getCurrentEntityId } from "@/lib/entity";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProject(formData: FormData) {
  const entityId = await getCurrentEntityId();
  if (!entityId) redirect("/onboarding");

  const name = formData.get("name") as string;
  if (!name?.trim()) return;

  const { data: project } = await supabase
    .from("projects")
    .insert({
      name: name.trim(),
      client: (formData.get("client") as string) || null,
      type: (formData.get("type") as string) || null,
      status: (formData.get("status") as string) || "active",
      deadline: (formData.get("deadline") as string) || null,
      description: (formData.get("description") as string) || null,
      entity_id: entityId,
    })
    .select()
    .single();

  revalidatePath("/projects");
  redirect(`/projects/${project?.id}`);
}

export async function updateProject(
  id: string,
  data: {
    name?: string;
    client?: string | null;
    type?: string | null;
    status?: string;
    deadline?: string | null;
    description?: string | null;
  }
) {
  await supabase.from("projects").update(data).eq("id", id);
  revalidatePath(`/projects/${id}`);
  revalidatePath("/projects");
}

export async function deleteProject(id: string) {
  await supabase.from("projects").delete().eq("id", id);
  revalidatePath("/projects");
  redirect("/projects");
}

export async function updateProjectTools(id: string, tools: string[]) {
  await supabase.from("projects").update({ tools }).eq("id", id);
  revalidatePath(`/projects/${id}`);
}

export async function getProjects() {
  const entityId = await getCurrentEntityId();
  if (!entityId) return [];

  const { data: projects } = await supabase
    .from("projects")
    .select(`*, posts(count), assets(count)`)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  return (projects ?? []).map((p: any) => ({
    ...p,
    _count: {
      posts: p.posts?.[0]?.count ?? 0,
      assets: p.assets?.[0]?.count ?? 0,
    },
  }));
}

export async function getProject(id: string) {
  const { data: project } = await supabase
    .from("projects")
    .select(`
      *,
      posts(*),
      assets(*),
      phases(*),
      tasks(*, sub_tasks(*), phase:phases(*))
    `)
    .eq("id", id)
    .order("order", { referencedTable: "tasks", ascending: true })
    .order("order", { referencedTable: "phases", ascending: true })
    .order("created_at", { referencedTable: "posts", ascending: false })
    .order("created_at", { referencedTable: "assets", ascending: false })
    .single();

  if (!project) return null;

  return {
    ...project,
    tasks: (project.tasks ?? []).map((t: any) => ({
      ...t,
      subTasks: t.sub_tasks ?? [],
      phaseId: t.phase_id,
    })),
    _count: {
      posts: project.posts?.length ?? 0,
      assets: project.assets?.length ?? 0,
      tasks: project.tasks?.length ?? 0,
    },
  };
}
