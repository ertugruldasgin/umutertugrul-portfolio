"use client";

import { Switch } from "@/components/ui/switch";
import type { BlogPost, TocItem } from "./types";
import { estimateReadingTime } from "./types";

interface BlogSidebarProps {
  post: BlogPost;
  isEditing: boolean;
  toc: TocItem[];
  activeHeading: string | null;
  editTitle: string;
  editTags: string;
  editPublished: boolean;
  onTitleChange: (title: string) => void;
  onTagsChange: (tags: string) => void;
  onPublishedChange: (published: boolean) => void;
}

function TocList({
  toc,
  activeHeading,
}: {
  toc: TocItem[];
  activeHeading: string | null;
}) {
  if (toc.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-primary/60 font-mono mb-1">index</span>
      {toc.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={(e) => {
            e.preventDefault();
            document
              .getElementById(item.id)
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          className={`text-sm font-mono line-clamp-2 transition-colors hover:text-primary ${
            activeHeading === item.id ? "text-primary" : "text-subtle/60"
          }`}
          style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
        >
          {item.text}
        </a>
      ))}
    </div>
  );
}

export function BlogSidebar({
  post,
  isEditing,
  toc,
  activeHeading,
  editTitle,
  editTags,
  editPublished,
  onTitleChange,
  onTagsChange,
  onPublishedChange,
}: BlogSidebarProps) {
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  if (isEditing) {
    return (
      <aside className="hidden lg:flex flex-col gap-6 w-48 shrink-0 sticky top-20 self-start">
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-foreground tracking-wide">title</span>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              className="bg-transparent border border-border rounded-md px-2 py-1 text-sm font-mono text-foreground placeholder:text-subtle/50"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-foreground tracking-wide">#</span>
            <input
              type="text"
              value={editTags}
              onChange={(e) => onTagsChange(e.target.value)}
              className="bg-transparent border border-border rounded-md px-2 py-1 text-sm font-mono text-foreground placeholder:text-subtle/50"
            />
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Switch
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-border/60 hover:cursor-pointer"
              checked={editPublished}
              onCheckedChange={onPublishedChange}
            />
            <span className="text-sm text-foreground tracking-wide">
              published
            </span>
          </label>
          <TocList toc={toc} activeHeading={activeHeading} />
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col gap-6 w-48 shrink-0 sticky top-20 self-start">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-primary/60 font-mono">timestamp</span>
          <span className="text-sm font-mono text-foreground">
            {formatDate(post.created_at)}
          </span>
        </div>

        {post.content && (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-primary/60 font-mono">eta</span>
            <span className="text-sm font-mono text-foreground">
              ~{estimateReadingTime(post.content)} min
            </span>
          </div>
        )}

        {post.tags.length > 0 && (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-primary/60 font-mono">#</span>
            <div className="flex flex-col">
              {post.tags.map((tag) => (
                <span key={tag} className="text-sm font-mono text-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <TocList toc={toc} activeHeading={activeHeading} />
    </aside>
  );
}
