import { useState, useEffect, useRef } from "react";
import { Content } from "@tiptap/react";
import { createClient } from "@/lib/supabase/client";
import type { BlogPost, TocItem } from "@/components/blog/types";
import { extractToc } from "@/components/blog/types";

export function useBlogEditor(initialPost: BlogPost) {
  const [post, setPost] = useState<BlogPost>(initialPost);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [unsavedOpen, setUnsavedOpen] = useState(false);
  const [toc, setToc] = useState<TocItem[]>(() =>
    extractToc(initialPost.content),
  );
  const [activeHeading, setActiveHeading] = useState<string | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editPublished, setEditPublished] = useState(false);

  const latestContent = useRef<Content>("");
  const initialized = useRef(false);
  const pendingAction = useRef<(() => void) | null>(null);

  const handleEdit = () => {
    setEditTitle(post.title);
    setEditTags(post.tags.join(", "));
    setEditPublished(post.published);
    setHasChanges(false);
    initialized.current = false;
    setIsEditing(true);
  };

  const handleContentChange = (content: Content) => {
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

  const handleTitleChange = (title: string) => {
    setEditTitle(title);
    setHasChanges(true);
  };

  const handleTagsChange = (tags: string) => {
    setEditTags(tags);
    setHasChanges(true);
  };

  const handlePublishedChange = (published: boolean) => {
    setEditPublished(published);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (saving || !hasChanges) return;
    setSaving(true);
    const supabase = createClient();

    const newTags = editTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const updatePayload = {
      title: editTitle,
      tags: newTags,
      published: editPublished,
      updated_at: new Date().toISOString(),
      ...(latestContent.current
        ? { content: latestContent.current as string }
        : {}),
    };

    await supabase.from("blogs").update(updatePayload).eq("id", post.id);

    setPost((prev) => ({
      ...prev,
      ...updatePayload,
    }));
    setHasChanges(false);
    setSaving(false);
  };

  const confirmCancel = () => {
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

  const guardNavigation = (navigate: () => void) => {
    if (hasChanges) {
      pendingAction.current = navigate;
      setUnsavedOpen(true);
      return true;
    }
    return false;
  };

  const handleConfirmDiscard = () => {
    setUnsavedOpen(false);
    pendingAction.current?.();
    pendingAction.current = null;
  };

  const handleCancelDiscard = () => {
    setUnsavedOpen(false);
    pendingAction.current = null;
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
    const handleBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isEditing, hasChanges]);

  // popstate
  useEffect(() => {
    if (!isEditing || !hasChanges) return;
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      pendingAction.current = () => window.history.back();
      setUnsavedOpen(true);
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isEditing, hasChanges]);

  // toc scroll observer
  useEffect(() => {
    if (isEditing) return;
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

  return {
    post,
    isEditing,
    saving,
    hasChanges,
    unsavedOpen,
    toc,
    activeHeading,
    editTitle,
    editTags,
    editPublished,

    handleEdit,
    handleContentChange,
    handleTitleChange,
    handleTagsChange,
    handlePublishedChange,
    handleSave,
    confirmCancel,
    guardNavigation,
    handleConfirmDiscard,
    handleCancelDiscard,
  };
}
