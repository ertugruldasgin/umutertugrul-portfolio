"use client";

import { PageHeader } from "@/components/page-header";
import MinimalTiptapThree from "@/components/ui/minimal-tiptap/components/custom/minimal-tiptap-three";
import { createClient } from "@/lib/supabase/client";
import { Content } from "@tiptap/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil1Icon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { SectionDivider } from "@/components/section-divider";
import Link from "next/link";
import { SuggestItem } from "@/components/suggest-item";

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
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
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
    setSaving(false);
  };

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
              disabled={saving}
              className="hover:cursor-pointer rounded-lg hover:bg-primary-hover"
            >
              <CheckIcon className="mr-1 size-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 gap-8">
        {isEditing ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-subtle font-mono">location</span>
                <input
                  type="text"
                  value={draftLocation}
                  onChange={(e) => setDraftLocation(e.target.value)}
                  placeholder="istanbul, turkey"
                  className="w-[212px] h-8 bg-transparent border border-border rounded-md px-2 py-1 text-sm font-mono text-primary placeholder:text-subtle/50"
                />
              </label>
            </div>
            <MinimalTiptapThree
              key="now-editor"
              value={draft}
              onChange={setDraft}
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
          <div>
            <p className="font-mono text-lg text-primary font-medium lowercase">
              last ping: {formatDate(update.created_at)}{" "}
              {update.location && (
                <span className="whitespace-nowrap">({update.location})</span>
              )}
            </p>
            <MinimalTiptapThree
              value={update.content}
              className="w-full"
              autofocus={true}
              editable={false}
              editorClassName=""
              editorContentClassName=""
            />
          </div>
        ) : null}
      </div>

      <div className="flex flex-col flex-1">
        <SectionDivider title="if you are still curious" />
        <div className="grid grid-cols-1 sm:grid-cols-2 py-4 gap-4">
          <SuggestItem
            href="/uses"
            title="uses"
            description="what i reach for, when i sit down"
          />
          <SuggestItem
            href="/activity"
            title="activity"
            description="a trail of things i've touched recently"
          />
          <SuggestItem
            href="/whoami"
            title="whoami"
            description="the long answer"
          />
        </div>
      </div>
    </div>
  );
}
