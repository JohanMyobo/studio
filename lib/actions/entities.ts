"use server";

import { supabase } from "@/lib/supabase/client";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ENTITY_COOKIE } from "@/lib/entity";

const ENTITY_EMOJIS: Record<string, string> = {
  "agency-nocode": "🔧",
  "agency-design": "🎨",
  "youtube": "🎬",
  "freelance": "💼",
  "saas": "🚀",
  "other": "⚡",
};

export async function createEntity(formData: FormData) {
  const name = formData.get("name") as string;
  const type = (formData.get("type") as string) || "other";
  const color = (formData.get("color") as string) || "#6366f1";
  const emoji = ENTITY_EMOJIS[type] ?? "⚡";

  if (!name?.trim()) return;

  const { data: entity } = await supabase
    .from("entities")
    .insert({ name: name.trim(), type, emoji, color })
    .select()
    .single();

  if (!entity) return;

  const cookieStore = await cookies();
  cookieStore.set(ENTITY_COOKIE, entity.id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/");
  redirect("/dashboard");
}

export async function switchEntity(entityId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ENTITY_COOKIE, entityId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/");
}

export async function updateEntity(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const color = formData.get("color") as string;
  const emoji = ENTITY_EMOJIS[type] ?? "⚡";

  if (!id || !name?.trim()) return;

  await supabase
    .from("entities")
    .update({ name: name.trim(), type, emoji, color })
    .eq("id", id);

  revalidatePath("/");
  redirect("/settings");
}

export async function getEntities() {
  const { data } = await supabase
    .from("entities")
    .select("*")
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function getEntity(id: string) {
  const { data } = await supabase
    .from("entities")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}
