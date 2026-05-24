"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, Trash2 } from "lucide-react";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { SectionDivider } from "@/components/section-divider";
import { PromptDialog } from "@/components/prompt-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { BlogPost } from "./types";
import { slugify, estimateReadingTime } from "./types";

interface BlogListProps {
  initialPosts: BlogPost[];
  isOwner: boolean;
}

export function BlogList({ initialPosts, isOwner }: BlogListProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [promptOpen, setPromptOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const router = useRouter();

  const published = posts.filter((p) => p.published);
  const drafts = posts.filter((p) => !p.published);

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

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const sectionTitle =
    published.length === 1 ? "1 blog" : `${published.length} blogs`;
  const draftTitle =
    drafts.length === 1 ? "1 draft" : `${drafts.length} drafts`;

  return (
    <>
      {/* header row with new button */}
      <div className="flex flex-row items-start justify-between">
        {isOwner && (
          <Button
            size="sm"
            onClick={() => setPromptOpen(true)}
            className="rounded-lg px-1.5 sm:px-2.5 hover:bg-primary-hover hover:cursor-pointer ml-auto"
          >
            <PlusIcon className="size-4" />
            <span className="hidden sm:block ml-1">New</span>
          </Button>
        )}
      </div>

      {/* drafts */}
      {isOwner && drafts.length > 0 && (
        <div className="flex flex-col gap-2">
          <SectionDivider
            title={draftTitle}
            titleClassName="text-warning"
            lineClassName="bg-warning"
          />
          {drafts.map((draft) => (
            <Link
              key={draft.id}
              href={`/blog/${draft.slug}`}
              className="group flex flex-row items-center gap-3 px-3 py-2.5 -mx-3 rounded-lg hover:bg-surface transition-colors"
            >
              <Pencil1Icon className="size-4 hidden md:block text-subtle/40 group-hover:text-warning transition-colors shrink-0" />
              <div className="flex flex-col flex-1 gap-0.5 min-w-0">
                <span className="font-mono text-sm sm:text-base text-foreground group-hover:text-warning transition-colors truncate">
                  {draft.title}
                </span>
                <span className="text-xs text-subtle/40 font-mono">
                  {formatDate(draft.updated_at)}
                </span>
              </div>
              <Trash2
                className="size-4 text-subtle/40 hover:text-danger transition-colors shrink-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleteTarget(draft.id);
                  setConfirmOpen(true);
                }}
              />
            </Link>
          ))}
        </div>
      )}

      {/* published */}
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
                {formatDate(post.created_at)}
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
    </>
  );
}
