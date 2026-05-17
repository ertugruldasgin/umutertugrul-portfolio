import BlogPostPage from "../blog-post-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: slug.replace(/-/g, " "),
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogPostPage slug={slug} />;
}
