import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BlogPostContent } from "@/components/blog/blog-post-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blogs")
    .select("title")
    .eq("slug", slug)
    .single();

  return {
    title: post?.title ?? slug.replace(/-/g, " "),
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!post) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = !!user && user.id === post.user_id;

  return (
    <div className="flex flex-col gap-6 flex-1 w-full max-w-5xl mx-auto">
      <BlogPostContent initialPost={post} isOwner={isOwner} />
    </div>
  );
}
