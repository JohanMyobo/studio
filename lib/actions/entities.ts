"use server";

import { prisma } from "@/lib/prisma";
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

  const entity = await prisma.entity.create({
    data: { name: name.trim(), type, emoji, color },
  });

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

  await prisma.entity.update({
    where: { id },
    data: { name: name.trim(), type, emoji, color },
  });

  revalidatePath("/");
  redirect("/settings");
}

export async function getEntities() {
  return prisma.entity.findMany({ orderBy: { createdAt: "asc" } });
}

export async function getEntity(id: string) {
  return prisma.entity.findUnique({ where: { id } });
}
