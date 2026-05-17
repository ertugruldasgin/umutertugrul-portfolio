import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { db: { schema: "portfolio" } },
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://umutertugrul.com";

  const pages = [
    { url: baseUrl, changeFrequency: "weekly" as const, priority: 1.0 },
    {
      url: `${baseUrl}/whoami`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/now`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/activity`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/reading`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/movies`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/uses`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/calendar`,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    },
  ].map((p) => ({ ...p, lastModified: new Date() }));

  const { data: posts } = await supabase
    .from("blogs")
    .select("slug, updated_at")
    .eq("published", true);

  const blogPages: MetadataRoute.Sitemap = (posts ?? []).map(
    (post: { slug: string; updated_at: string }) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }),
  );

  return [...pages, ...blogPages];
}
