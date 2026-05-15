import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = "project-assets";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    const projectId = form.get("projectId") as string | null;

    if (!file || !projectId) {
      return NextResponse.json({ error: "Missing file or projectId" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mime = file.type;

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storageKey = `${projectId}/${Date.now()}_${safeName}`;

    const { error: storageError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(storageKey, buffer, { contentType: mime, upsert: false });

    if (storageError) {
      console.error("Storage error:", storageError);
      return NextResponse.json({ error: storageError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(storageKey);

    const type = mime.startsWith("image/")
      ? "image"
      : mime === "application/pdf"
      ? "pdf"
      : mime.includes("word") || mime.includes("document")
      ? "doc"
      : "text";

    const { data: asset } = await supabase
      .from("assets")
      .insert({
        name: file.name,
        type,
        url: publicUrl,
        size: file.size,
        mime_type: mime,
        project_id: projectId,
      })
      .select()
      .single();

    revalidatePath(`/projects/${projectId}`);
    return NextResponse.json(asset);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { data: asset } = await supabase
      .from("assets")
      .select("url")
      .eq("id", id)
      .single();

    if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Extract storage key from URL if it's a Supabase Storage URL
    try {
      const urlObj = new URL(asset.url);
      const pathParts = urlObj.pathname.split(`/${BUCKET}/`);
      if (pathParts.length > 1) {
        await supabaseAdmin.storage.from(BUCKET).remove([pathParts[1]]);
      }
    } catch {
      // Non-storage URL, skip
    }

    const { data: deleted } = await supabase
      .from("assets")
      .delete()
      .eq("id", id)
      .select("project_id")
      .single();

    if (deleted?.project_id) revalidatePath(`/projects/${deleted.project_id}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
