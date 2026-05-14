"use client";

import { PageHeader } from "@/components/page-header";
import MinimalTiptapThree from "@/components/ui/minimal-tiptap/components/custom/minimal-tiptap-three";
import { createClient } from "@/lib/supabase/client";
import { Content } from "@tiptap/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil1Icon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { SubHeader } from "@/components/sub-header";
import { SectionDivider } from "@/components/section-divider";
import type { User } from "@supabase/supabase-js";

const OWNER_EMAIL = "ertugruldasgin@hotmail.com";

export default function NowPage() {
  const [value, setValue] = useState<Content>("");
  const [draft, setDraft] = useState<Content>("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const isOwner = user?.email === OWNER_EMAIL;

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const fetchLatest = async () => {
      const { data } = await supabase
        .from("now_updates")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(1)
        .single();

      if (data) setValue(data.content);
    };
    fetchLatest();
  }, []);

  const handleEdit = () => {
    setDraft(value);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft("");
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("now_updates").insert({
      content: draft,
      published_at: new Date().toISOString(),
      user_id: user.id,
    });
    setValue(draft);
    setIsEditing(false);
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-12 flex-1 w-full max-w-3xl ml-auto mr-auto">
      <div className="flex items-start justify-between">
        <PageHeader
          title="now"
          description={
            "where my focus is right now.\nthis site is inspired by Derek Sivers' /now project."
          }
        />
        {isOwner && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="hover:cursor-pointer rounded-lg hover:bg-primary-hover/10"
          >
            <Pencil1Icon className="mr-2 size-4" />
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
              <Cross2Icon className="mr-2 size-4" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="hover:cursor-pointer rounded-lg hover:bg-primary-hover"
            >
              <CheckIcon className="mr-2 size-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 gap-8">
        {isEditing ? (
          <MinimalTiptapThree
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
        ) : (
          <div>
            <SubHeader
              className="text-primary font-mono text-base font-medium lowercase"
              title={"last ping: 13-05-2026"}
            />
            <div
              className="minimal-tiptap-editor prose prose-neutral dark:prose-invert max-w-none pt-2"
              dangerouslySetInnerHTML={{ __html: value as string }}
            />
          </div>
        )}
      </div>

      <SectionDivider title="if i am interesting enough for you" />
    </div>
  );
}
