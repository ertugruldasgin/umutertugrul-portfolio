"use client";

import MinimalTiptapThree from "@/components/ui/minimal-tiptap/components/custom/minimal-tiptap-three";
import { createClient } from "@/lib/supabase/client";
import { Content } from "@tiptap/react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@radix-ui/react-icons";
import { ConfirmDialog } from "@/components/confirm-dialog";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  tags: string[];
  published: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractToc(html: string): TocItem[] {
  if (typeof window === "undefined") return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");
  return Array.from(headings).map((h, i) => ({
    id: `heading-${i}`,
    text: h.textContent || "",
    level: parseInt(h.tagName[1]),
  }));
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function BlogPostPage({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeHeading, setActiveHeading] = useState<string | null>(null);
  const latestContent = useRef<Content>("");
  const initialized = useRef(false);
  const [unsavedOpen, setUnsavedOpen] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editPublished, setEditPublished] = useState(false);

  const hasChangesRef = useRef(false);
  useEffect(() => {
    hasChangesRef.current = hasChanges;
  }, [hasChanges]);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();

      const { data } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .single();

      if (data) {
        setPost(data as BlogPost);
        setToc(extractToc(data.content));
        setEditTitle(data.title);
        setEditTags((data.tags as string[]).join(", "));
        setEditPublished(data.published);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && data && user.id === data.user_id) {
        setIsOwner(true);
      }
    };

    init();
  }, [slug]);

  // toc scroll observer
  useEffect(() => {
    if (!post) return;

    const contentEl = document.querySelector(".minimal-tiptap-editor");
    if (!contentEl) return;

    const headings = contentEl.querySelectorAll("h1, h2, h3, h4, h5, h6");
    headings.forEach((h, i) => {
      h.id = `heading-${i}`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [post, isEditing, toc]);

  const handleChange = (content: Content) => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    latestContent.current = content;
    setHasChanges(true);
    if (typeof content === "string") {
      setToc(extractToc(content));
    }
  };

  const handleSave = async () => {
    if (!post || saving || !hasChanges) return;
    setSaving(true);
    const supabase = createClient();

    const newTags = editTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const updates: any = {
      title: editTitle,
      tags: newTags,
      published: editPublished,
      updated_at: new Date().toISOString(),
    };

    if (latestContent.current) {
      updates.content = latestContent.current as string;
    }

    await supabase.from("blogs").update(updates).eq("id", post.id);

    setPost((prev) =>
      prev
        ? {
            ...prev,
            ...updates,
            tags: newTags,
          }
        : null,
    );
    setHasChanges(false);
    setSaving(false);
  };

  const handleEdit = () => {
    setEditTitle(post?.title || "");
    setEditTags(post?.tags.join(", ") || "");
    setEditPublished(post?.published || false);
    setHasChanges(false);
    initialized.current = false;
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (hasChanges) {
      pendingAction.current = () => {
        setIsEditing(false);
        setHasChanges(false);
        initialized.current = false;
      };
      setUnsavedOpen(true);
      return;
    }
    setIsEditing(false);
    setHasChanges(false);
    initialized.current = false;
  };

  // ctrl+s
  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // beforeunload
  useEffect(() => {
    if (!isEditing || !hasChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isEditing, hasChanges]);

  // popstate
  useEffect(() => {
    if (!isEditing || !hasChanges) return;

    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      pendingAction.current = () => {
        window.history.back();
      };
      setUnsavedOpen(true);
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isEditing, hasChanges]);

  if (!post) {
    return (
      <div className="flex flex-col gap-6 flex-1 w-full max-w-5xl mx-auto">
        <p className="text-subtle font-mono text-sm py-8 text-center">
          loading...
        </p>
      </div>
    );
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="flex flex-col gap-6 flex-1 w-full max-w-5xl mx-auto">
      {/* top bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/blog"
          onClick={(e) => {
            if (hasChanges) {
              e.preventDefault();
              pendingAction.current = () => {
                window.location.href = "/blog";
              };
              setUnsavedOpen(true);
            }
          }}
          className="text-subtle hover:text-primary transition-colors font-mono text-sm flex items-center gap-1"
        >
          ../
        </Link>
        {isOwner && !isEditing && (
          <Button
            size="sm"
            onClick={handleEdit}
            className="hover:cursor-pointer rounded-lg bg-primary hover:bg-primary-hover px-2.5"
          >
            Edit
          </Button>
        )}
        {isOwner && isEditing && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              className="hover:cursor-pointer rounded-lg hover:bg-primary-hover/10"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="hover:cursor-pointer rounded-lg bg-primary hover:bg-primary-hover px-2.5"
            >
              <CheckIcon className="size-4 mr-1" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      {/* main layout */}
      <div className="flex gap-12">
        {/* sidebar */}
        <aside className="hidden lg:flex flex-col gap-6 w-48 shrink-0 sticky top-20 self-start">
          {isEditing ? (
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-foreground tracking-wide">
                  title
                </span>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    setHasChanges(true);
                  }}
                  className="bg-transparent border border-border rounded-md px-2 py-1 text-sm font-mono text-foreground placeholder:text-subtle/50"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-foreground tracking-wide">#</span>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => {
                    setEditTags(e.target.value);
                    setHasChanges(true);
                  }}
                  className="bg-transparent border border-border rounded-md px-2 py-1 text-sm font-mono text-foreground placeholder:text-subtle/50"
                />
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch
                  className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-border/60 hover:cursor-pointer"
                  checked={editPublished}
                  onCheckedChange={(checked) => {
                    setEditPublished(checked);
                    setHasChanges(true);
                  }}
                />
                <span className="text-sm text-foreground tracking-wide">
                  published
                </span>
              </label>
              {toc.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-primary/60 font-mono mb-1">
                    index
                  </span>
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
                        activeHeading === item.id
                          ? "text-primary"
                          : "text-subtle/60"
                      }`}
                      style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                    >
                      {item.text}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* metadata */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-primary/60 font-mono">
                    timestamp
                  </span>
                  <span className="text-sm font-mono text-foreground">
                    {formatDate(post.created_at)}
                  </span>
                </div>

                {post.content && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-primary/60 font-mono">
                      eta
                    </span>
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
                        <span
                          key={tag}
                          className="text-sm font-mono text-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* table of contents */}
              {toc.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-primary/60 font-mono mb-1">
                    index
                  </span>
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
                        activeHeading === item.id
                          ? "text-primary"
                          : "text-subtle/60"
                      }`}
                      style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                    >
                      {item.text}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </aside>

        {/* content */}
        <article className="flex-1 min-w-0">
          {!isEditing && (
            <>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-foreground font-medium mb-2 lg:mb-6">
                {post.title}
              </h1>
              <div className="flex flex-col items-baseline lg:hidden mb-6">
                {post.tags.length > 0 && (
                  <div className="flex flex-row gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-xs font-mono text-subtle">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {post.content && (
                  <div className="">
                    <span className="text-xs font-mono text-subtle">
                      ~{estimateReadingTime(post.content)} min
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          <MinimalTiptapThree
            key={isEditing ? "edit" : "view"}
            value={post.content}
            onChange={handleChange}
            className="w-full"
            editorContentClassName="-mt-4"
            output="html"
            placeholder="start writing..."
            autofocus={isEditing}
            editable={isEditing}
            editorClassName=""
          />
        </article>
      </div>

      <ConfirmDialog
        open={unsavedOpen}
        title="$ discard"
        description="you have unsaved changes. leave anyway?"
        onConfirm={() => {
          setUnsavedOpen(false);
          pendingAction.current?.();
          pendingAction.current = null;
        }}
        onCancel={() => {
          setUnsavedOpen(false);
          pendingAction.current = null;
        }}
      />
    </div>
  );
}
