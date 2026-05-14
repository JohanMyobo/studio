"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentEntityId } from "@/lib/entity";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProject(formData: FormData) {
  const entityId = await getCurrentEntityId();
  if (!entityId) redirect("/onboarding");

  const name = formData.get("name") as string;
  if (!name?.trim()) return;

  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      client: (formData.get("client") as string) || null,
      type: (formData.get("type") as string) || null,
      status: (formData.get("status") as string) || "active",
      deadline: formData.get("deadline")
        ? new Date(formData.get("deadline") as string)
        : null,
      description: (formData.get("description") as string) || null,
      entityId,
    },
  });

  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function updateProject(
  id: string,
  data: {
    name?: string;
    client?: string;
    type?: string;
    status?: string;
    deadline?: string;
    description?: string;
  }
) {
  await prisma.project.update({
    where: { id },
    data: {
      ...data,
      deadline: data.deadline ? new Date(data.deadline) : null,
    },
  });
  revalidatePath(`/projects/${id}`);
  revalidatePath("/projects");
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/projects");
  redirect("/projects");
}

export async function getProjects() {
  const entityId = await getCurrentEntityId();
  if (!entityId) return [];

  return prisma.project.findMany({
    where: { entityId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { posts: true, assets: true } },
    },
  });
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      posts: { orderBy: { createdAt: "desc" } },
      assets: { orderBy: { createdAt: "desc" } },
      phases: { orderBy: { order: "asc" } },
      tasks: {
        orderBy: { order: "asc" },
        include: {
          subTasks: { orderBy: { order: "asc" } },
          phase: true,
        },
      },
      _count: { select: { posts: true, assets: true, tasks: true } },
    },
  });
}
