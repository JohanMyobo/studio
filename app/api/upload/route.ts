import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import { supabase } from "@/lib/supabase/client";

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

    const uploadDir = path.join(process.cwd(), "public", "uploads", projectId);
    await mkdir(uploadDir, { recursive: true });

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${Date.now()}_${safeName}`;
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/${projectId}/${filename}`;
    const mime = file.type;
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
        url,
        size: file.size,
        mime_type: mime,
        project_id: projectId,
      })
      .select()
      .single();

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

    try {
      const filepath = path.join(process.cwd(), "public", asset.url);
      await unlink(filepath);
    } catch {
      // File may not exist, continue
    }

    await supabase.from("assets").delete().eq("id", id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
