"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentEntityId } from "@/lib/entity";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const projectId = formData.get("projectId") as string;
  const platform = formData.get("platform") as string;

  if (!title?.trim() || !projectId || !platform) return;

  const scheduledAtRaw = formData.get("scheduledAt") as string;

  await prisma.post.create({
    data: {
      title: title.trim(),
      content: (formData.get("content") as string) || null,
      platform,
      tone: (formData.get("tone") as string) || null,
      status: (formData.get("status") as string) || "draft",
      scheduledAt: scheduledAtRaw ? new Date(scheduledAtRaw) : null,
      projectId,
    },
  });

  revalidatePath("/posts");
  redirect("/posts");
}

export async function updatePost(
  id: string,
  data: {
    title?: string;
    content?: string;
    platform?: string;
    tone?: string;
    status?: string;
    scheduledAt?: string;
    publishedAt?: string;
    likes?: number;
    views?: number;
    comments?: number;
    shares?: number;
  }
) {
  await prisma.post.update({
    where: { id },
    data: {
      ...data,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
    },
  });
  revalidatePath("/posts");
  revalidatePath(`/posts/${id}`);
}

export async function deletePost(id: string) {
  await prisma.post.delete({ where: { id } });
  revalidatePath("/posts");
  redirect("/posts");
}

export async function getPosts(filters?: {
  status?: string;
  platform?: string;
}) {
  const entityId = await getCurrentEntityId();
  if (!entityId) return [];

  return prisma.post.findMany({
    where: {
      project: { entityId },
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.platform ? { platform: filters.platform } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { id: true, name: true } },
    },
  });
}

export async function getPostsForCalendar() {
  const entityId = await getCurrentEntityId();
  if (!entityId) return [];

  return prisma.post.findMany({
    where: {
      project: { entityId },
      OR: [
        { status: "scheduled", scheduledAt: { not: null } },
        { status: "published" },
      ],
    },
    include: { project: { select: { id: true, name: true } } },
    orderBy: { scheduledAt: "asc" },
  });
}
