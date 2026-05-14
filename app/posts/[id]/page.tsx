import { getPost } from "@/lib/actions/posts";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PostEditor } from "@/components/posts/post-editor";

const PLATFORM_EMOJIS: Record<string, string> = {
  linkedin: "💼", twitter: "🐦", instagram: "📸", facebook: "👤", tiktok: "🎵",
};

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/posts"
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Posts
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{PLATFORM_EMOJIS[post.platform] ?? "📝"}</span>
          <span>{post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}</span>
          <span>·</span>
          <Link href={`/projects/${post.project.id}`} className="hover:text-foreground transition-colors">
            {post.project.name}
          </Link>
        </div>
      </div>

      <PostEditor post={post as any} />
    </div>
  );
}
