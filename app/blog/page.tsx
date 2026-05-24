import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { BlogList } from "@/components/blog/blog-list";

export const metadata = {
  title: "blog",
};

export default async function BlogPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = !!user;

  return (
    <div className="flex flex-col gap-12 flex-1 w-full max-w-3xl mx-auto">
      <PageHeader title="blog" description="things i think about" />
      <BlogList initialPosts={posts || []} isOwner={isOwner} />
    </div>
  );
}
