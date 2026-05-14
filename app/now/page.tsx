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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface NowUpdate {
  id: string;
  content: string;
  location: string | null;
  published_at: string;
  user_id: string | null;
}

export default function NowPage() {
  const [update, setUpdate] = useState<NowUpdate | null>(null);
  const [draft, setDraft] = useState<Content>("");
  const [draftDate, setDraftDate] = useState("");
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
        .order("published_at", { ascending: false })
        .limit(1)
        .single();

      if (latest) setUpdate(latest);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && latest && user.id === latest.user_id) {
        setIsOwner(true);
      }
    };

    init();
  }, []);

  const handleEdit = () => {
    if (!update) return;
    setDraft(update.content);
    setDraftDate(update.published_at.split("T")[0]);
    setDraftLocation(update.location ?? "");
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

    const payload = {
      content: draft,
      published_at: new Date(draftDate).toISOString(),
      location: draftLocation || null,
      user_id: user.id,
    };

    const { data } = await supabase
      .from("now_updates")
      .insert(payload)
      .select()
      .single();

    if (data) setUpdate(data);
    setIsEditing(false);
    setSaving(false);
  };

  const formatDate = (iso: string) => {
    return format(new Date(iso), "dd-MM-yyyy");
  };

  return (
    <div className="flex flex-col gap-6 md:gap-12 flex-1 w-full max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
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
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-subtle font-mono">date</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left font-mono text-sm rounded-md text-primary hover:text-primary-hover hover:cursor-pointer",
                        !draftDate && "text-subtle/50",
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {draftDate
                        ? format(new Date(draftDate), "dd-MM-yyyy")
                        : "pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={draftDate ? new Date(draftDate) : undefined}
                      onSelect={(date) =>
                        setDraftDate(
                          date
                            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                            : "",
                        )
                      }
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-subtle font-mono">location</span>
                <input
                  type="text"
                  value={draftLocation}
                  onChange={(e) => setDraftLocation(e.target.value)}
                  placeholder="istanbul, turkey"
                  className="h-full bg-transparent border border-border rounded-md px-2 py-1 text-sm font-mono text-primary placeholder:text-subtle/50"
                />
              </label>
            </div>
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
          </div>
        ) : update ? (
          <div>
            <SubHeader
              className="text-primary font-mono text-base font-medium lowercase"
              title={`last ping: ${formatDate(update.published_at)}${
                update.location ? ` - ${update.location}` : ""
              }`}
            />
            <div
              className="minimal-tiptap-editor prose prose-neutral dark:prose-invert max-w-none pt-2"
              dangerouslySetInnerHTML={{ __html: update.content }}
            />
          </div>
        ) : null}
      </div>

      <SectionDivider title="if you are still curious" />
    </div>
  );
}
