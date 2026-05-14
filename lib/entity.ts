import { cookies } from "next/headers";

export const ENTITY_COOKIE = "studio_entity_id";

export async function getCurrentEntityId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ENTITY_COOKIE)?.value ?? null;
}
