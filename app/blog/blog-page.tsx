"use client";

import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { PlusIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { SectionDivider } from "@/components/section-divider";
import Link from "next/link";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { PromptDialog } from "@/components/prompt-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  tags: string[];
  published: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();

      const { data: list } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });

      if (list) setPosts(list as BlogPost[]);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setIsOwner(true);
    };

    init();
  }, []);

  const handleCreate = async (title: string) => {
    setPromptOpen(false);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const slug = slugify(title) || "untitled";

    const { data } = await supabase
      .from("blogs")
      .insert({
        title,
        slug,
        content: "",
        tags: [],
        published: false,
        user_id: user.id,
      })
      .select()
      .single();

    if (data) {
      router.push(`/blog/${data.slug}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setConfirmOpen(false);
    const supabase = createClient();
    await supabase.from("blogs").delete().eq("id", deleteTarget);
    setPosts((prev) => prev.filter((p) => p.id !== deleteTarget));
    setDeleteTarget(null);
  };

  const published = posts.filter((p) => p.published);
  const drafts = posts.filter((p) => !p.published);
  const sectionTitle =
    published.length == 1 ? "1 blog" : `${published.length} blogs`;

  return (
    <div className="flex flex-col gap-12 flex-1 w-full max-w-3xl ml-auto mr-auto">
      <div className="flex flex-row items-start justify-between">
        <PageHeader title="blog" description="things i think about" />
        {isOwner && (
          <Button
            size="sm"
            onClick={() => setPromptOpen(true)}
            className="rounded-lg px-1.5 sm:px-2.5 hover:bg-primary-hover hover:cursor-pointer"
          >
            {" "}
            <PlusIcon className="size-4" />
            <span className="hidden sm:block ml-1">New</span>
          </Button>
        )}
      </div>

      {isOwner && drafts.length >= 0 && (
        <div className="flex flex-col gap-2">
          <SectionDivider
            title="drafts"
            titleClassName="text-warning"
            lineClassName="bg-warning"
          />
          {drafts.map((draft) => (
            <Link
              key={draft.id}
              href={`/blog/${[draft.slug]}`}
              className="group flex flex-row items-center gap-3 px-3 py-2.5 -mx-3 rounded-lg hover:bg-surface transition-colors"
            >
              <Pencil1Icon className="size-4 hidden md:block text-subtle/40 group-hover:text-warning transition-colors shrink-0" />
              <div className="flex flex-col flex-1 gap-0.5 min-w-0">
                <span className="font-mono text-sm sm:text-base text-foreground group-hover:text-warning transition-colors truncate">
                  {draft.title}
                </span>
                <span className="text-xs text-subtle/40 font-mono">
                  {new Date(draft.updated_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              {isOwner && (
                <Trash2
                  className="size-4 text-subtle/40 hover:text-danger transition-colors shrink-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteTarget(draft.id);
                    setConfirmOpen(true);
                  }}
                />
              )}
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <SectionDivider
          title={sectionTitle}
          titleClassName="text-primary"
          lineClassName="bg-primary"
        />
        {published.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex flex-col gap-1.5 px-3 py-3 -mx-3 rounded-lg hover:bg-surface transition-colors"
          >
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-mono text-sm sm:text-base md:text-lg text-foreground group-hover:text-primary transition-colors">
                {post.title}
              </span>
              <span className="text-xs text-subtle/40 font-mono shrink-0">
                {new Date(post.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs font-mono text-subtle/60">
                  {tag}
                </span>
              ))}
              {post.content && (
                <span className="text-xs font-mono text-subtle/30">
                  ~{estimateReadingTime(post.content)} min
                </span>
              )}
            </div>
          </Link>
        ))}

        {published.length === 0 && !isOwner && (
          <p className="text-subtle font-mono text-sm sm:text-base py-8 text-center">
            nothing here yet.
          </p>
        )}
      </div>

      <PromptDialog
        open={promptOpen}
        title="$ touch"
        defaultValue=""
        placeholder="post title"
        onConfirm={handleCreate}
        onCancel={() => setPromptOpen(false)}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="$ rm -rf"
        description="delete this post?"
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
