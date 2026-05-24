"use client";

import { PageHeader } from "@/components/page-header";
import MinimalTiptapThree from "@/components/ui/minimal-tiptap/components/custom/minimal-tiptap-three";
import { createClient } from "@/lib/supabase/client";
import { Content } from "@tiptap/react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Pencil1Icon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { SectionDivider } from "@/components/section-divider";
import Link from "next/link";
import { SuggestItem } from "@/components/suggest-item";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Input } from "@/components/ui/input";

interface NowUpdate {
  id: string;
  content: string;
  location: string | null;
  created_at: string;
  user_id: string | null;
}

export default function NowPage() {
  const [update, setUpdate] = useState<NowUpdate | null>(null);
  const [draft, setDraft] = useState<Content>("");
  const [draftLocation, setDraftLocation] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [unsavedOpen, setUnsavedOpen] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const init = async () => {
      const { data: latest } = await supabase
        .from("now_updates")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (latest) setUpdate(latest);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && (!latest || user.id === latest.user_id)) {
        setIsOwner(true);
      }
    };

    init();
  }, []);

  const handleEdit = () => {
    setDraft(update?.content ?? "");
    setDraftLocation(update?.location ?? "");
    setHasChanges(false);
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (hasChanges) {
      pendingAction.current = () => {
        setIsEditing(false);
        setHasChanges(false);
      };
      setUnsavedOpen(true);
      return;
    }
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleDraftChange = (content: Content) => {
    setDraft(content);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (saving || !hasChanges) return;
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("now_updates")
      .insert({
        content: draft,
        location: draftLocation || null,
        user_id: user.id,
      })
      .select()
      .single();

    if (data) setUpdate(data);
    setIsEditing(false);
    setHasChanges(false);
    setSaving(false);
  };

  // ctrl+s save
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

  // beforeunload for tab close
  useEffect(() => {
    if (!isEditing || !hasChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isEditing, hasChanges]);

  // popstate for browser back
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

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-6 md:gap-12 flex-1 w-full max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <PageHeader
          title="now"
          description={
            <span className="flex flex-col">
              <span>where my focus is right now.</span>
              <span>
                this site is inspired by Derek Sivers&apos;{" "}
                <Link
                  href="https://nownownow.com/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-hover transition-colors"
                >
                  /now
                </Link>{" "}
                project.
              </span>
            </span>
          }
        />
        {isOwner && !isEditing && (
          <Button
            size="sm"
            onClick={handleEdit}
            className="hover:cursor-pointer rounded-lg bg-primary hover:bg-primary-hover"
          >
            <Pencil1Icon className="mr-1 size-4" />
            Edit
          </Button>
        )}
        {isOwner && isEditing && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="hover:cursor-pointer rounded-lg hover:bg-primary-hover/10"
            >
              <Cross2Icon className="mr-1 size-4" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="hover:cursor-pointer rounded-lg hover:bg-primary-hover"
            >
              <CheckIcon className="mr-1 size-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-subtle font-mono">location</span>
              <Input
                type="text"
                value={draftLocation}
                onChange={(e) => {
                  setDraftLocation(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="istanbul, turkey"
                className="h-8 bg-transparent border border-border rounded-md px-2 py-1 text-sm font-mono text-primary placeholder:text-subtle/50"
              />
            </label>
          </div>
          <MinimalTiptapThree
            key="now-editor"
            value={draft}
            onChange={handleDraftChange}
            className="w-full min-h-96"
            editorContentClassName=""
            output="html"
            placeholder="What are you up to?"
            autofocus={true}
            editable={true}
            editorClassName=""
          />
        </div>
      ) : update ? (
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-mono text-sm md:text-base text-primary font-medium lowercase">
            last ping: {formatDate(update.created_at)}{" "}
            {update.location && (
              <span className="whitespace-nowrap">({update.location})</span>
            )}
          </p>
          <MinimalTiptapThree
            value={update.content}
            className=""
            autofocus={false}
            editable={false}
            editorClassName=""
            editorContentClassName=""
          />
        </div>
      ) : null}

      <div className="flex flex-col flex-1">
        <SectionDivider title="if you are still curious" />
        <div className="grid grid-cols-1 sm:grid-cols-2 pt-4 gap-4">
          <SuggestItem
            href="/blog"
            title="blog"
            description="things i think about"
          />
          <SuggestItem
            href="/uses"
            title="uses"
            description="what i reach for, when i sit down"
          />
          <SuggestItem
            href="/reading"
            title="reading"
            description="digital bookshelf"
          />
          <SuggestItem
            href="/whoami"
            title="whoami"
            description="the long answer"
          />
        </div>
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
