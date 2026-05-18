"use server";

import { supabase } from "@/lib/supabase/client";
import { getCurrentEntityId } from "@/lib/entity";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getPost(id: string) {
  const { data } = await supabase
    .from("posts")
    .select("*, project:projects(id, name, description, tools, assets(*))")
    .eq("id", id)
    .single();
  return data;
}

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const projectId = formData.get("projectId") as string;
  const platform = formData.get("platform") as string;

  if (!title?.trim() || !projectId || !platform) return;

  const scheduledAtRaw = formData.get("scheduledAt") as string;

  const { data: post } = await supabase
    .from("posts")
    .insert({
      title: title.trim(),
      content: (formData.get("content") as string) || null,
      platform,
      tone: (formData.get("tone") as string) || null,
      status: (formData.get("status") as string) || "draft",
      scheduled_at: scheduledAtRaw ? new Date(scheduledAtRaw).toISOString() : null,
      project_id: projectId,
    })
    .select()
    .single();

  revalidatePath("/posts");
  redirect(`/posts/${post?.id}`);
}

export async function updatePost(
  id: string,
  data: {
    title?: string;
    content?: string | null;
    platform?: string;
    tone?: string | null;
    status?: string;
    scheduledAt?: string | null;
    publishedAt?: string | null;
    likes?: number | null;
    views?: number | null;
    comments?: number | null;
    shares?: number | null;
  }
) {
  const { scheduledAt, publishedAt, ...rest } = data;
  const payload: any = { ...rest };
  if (scheduledAt !== undefined) payload.scheduled_at = scheduledAt ? new Date(scheduledAt).toISOString() : null;
  if (publishedAt !== undefined) payload.published_at = publishedAt ? new Date(publishedAt).toISOString() : null;

  await supabase.from("posts").update(payload).eq("id", id);
  revalidatePath("/posts");
  revalidatePath(`/posts/${id}`);
}

export async function deletePost(id: string) {
  await supabase.from("posts").delete().eq("id", id);
  revalidatePath("/posts");
  redirect("/posts");
}

export async function getPosts(filters?: { status?: string; platform?: string }) {
  const entityId = await getCurrentEntityId();
  if (!entityId) return [];

  let query = supabase
    .from("posts")
    .select("*, project:projects!inner(id, name, entity_id)")
    .eq("projects.entity_id", entityId)
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.platform) query = query.eq("platform", filters.platform);

  const { data } = await query;

  return (data ?? []).map((p: any) => ({
    ...p,
    scheduledAt: p.scheduled_at,
    publishedAt: p.published_at,
    projectId: p.project_id,
  }));
}

export async function getPostsForCalendar() {
  const entityId = await getCurrentEntityId();
  if (!entityId) return [];

  const { data } = await supabase
    .from("posts")
    .select("*, project:projects!inner(id, name, entity_id)")
    .eq("projects.entity_id", entityId)
    .in("status", ["scheduled", "published"])
    .order("scheduled_at", { ascending: true });

  return (data ?? []).map((p: any) => ({
    ...p,
    scheduledAt: p.scheduled_at,
    publishedAt: p.published_at,
    projectId: p.project_id,
  }));
}
