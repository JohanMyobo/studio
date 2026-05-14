"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, Image, File, Link as LinkIcon, ExternalLink } from "lucide-react";

type Asset = {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number | null;
  mimeType: string | null;
};

type Props = {
  projectId: string;
  assets: Asset[];
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  image: Image,
  pdf: FileText,
  doc: FileText,
  text: FileText,
  link: LinkIcon,
};

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AssetUploader({ projectId, assets: initialAssets }: Props) {
  const [assets, setAssets] = useState(initialAssets);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      form.append("projectId", projectId);

      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (res.ok) {
        const asset = await res.json();
        setAssets((prev) => [...prev, asset]);
      }
    }
    setUploading(false);
  }

  async function deleteAsset(id: string) {
    await fetch(`/api/upload?id=${id}`, { method: "DELETE" });
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed py-8 transition-colors ${
          dragOver ? "border-white/30 bg-white/5" : "border-border/50 hover:border-border hover:bg-white/[0.02]"
        }`}
      >
        <Upload className="mb-2 h-5 w-5 text-muted-foreground" />
        <p className="text-sm font-medium">Dépose tes fichiers ici</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Images, PDFs, documents — {uploading ? "Upload en cours…" : "clique ou glisse"}
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => uploadFiles(e.target.files)}
          accept="image/*,.pdf,.doc,.docx,.txt,.md"
        />
      </div>

      {/* Asset list */}
      {assets.length > 0 && (
        <div className="mt-4 space-y-2">
          {assets.map((asset) => {
            const Icon = TYPE_ICONS[asset.type] ?? File;
            return (
              <div
                key={asset.id}
                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm truncate">{asset.name}</p>
                    {asset.size && (
                      <p className="text-xs text-muted-foreground">{formatSize(asset.size)}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded p-1 hover:bg-white/10 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                  <button
                    onClick={() => deleteAsset(asset.id)}
                    className="rounded p-1 hover:bg-white/10 transition-colors"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
