"use client";

import MinimalTiptapThree from "@/components/ui/minimal-tiptap/components/custom/minimal-tiptap-three";
import { Button } from "@/components/ui/button";
import { Pencil1Icon, CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useNowEditor, NowUpdate } from "@/hooks/use-now-editor";
import { Input } from "@/components/ui/input";

interface NowContentProps {
  initialUpdate: NowUpdate | null;
  isOwner: boolean;
}

export default function NowContent({
  initialUpdate,
  isOwner,
}: NowContentProps) {
  const editor = useNowEditor(initialUpdate);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="absolute right-0 top-0 mt-6 mr-4 md:mr-0 md:-mt-16 md:relative md:flex md:justify-end z-10">
        {isOwner && !editor.isEditing && (
          <Button
            size="sm"
            onClick={editor.handleEdit}
            className="hover:cursor-pointer rounded-lg bg-primary hover:bg-primary-hover"
          >
            <Pencil1Icon className="mr-1 size-4" /> Edit
          </Button>
        )}

        {isOwner && editor.isEditing && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={editor.confirmCancel}
              className="hover:cursor-pointer rounded-lg hover:bg-primary-hover/10"
            >
              <Cross2Icon className="mr-1 size-4" /> Cancel
            </Button>
            <Button
              size="sm"
              onClick={editor.handleSave}
              disabled={editor.saving || !editor.hasChanges}
              className="hover:cursor-pointer rounded-lg hover:bg-primary-hover"
            >
              <CheckIcon className="mr-1 size-4" />{" "}
              {editor.saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>
      {editor.isEditing ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-subtle font-mono">location</span>
              <Input
                type="text"
                value={editor.draftLocation}
                onChange={(e) => editor.handleLocationChange(e.target.value)}
                placeholder="istanbul, turkey"
                className="h-8 bg-transparent border border-border rounded-md px-2 py-1 text-sm font-mono text-primary placeholder:text-subtle/50"
              />
            </label>
          </div>
          <MinimalTiptapThree
            key="now-editor"
            value={editor.draft}
            onChange={editor.handleDraftChange}
            className="w-full min-h-96"
            output="html"
            placeholder="What are you up to?"
            autofocus={true}
            editable={true}
          />
        </div>
      ) : editor.update ? (
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-mono text-sm md:text-base text-primary font-medium lowercase">
            last ping: {formatDate(editor.update.created_at)}{" "}
            {editor.update.location && (
              <span className="whitespace-nowrap">
                ({editor.update.location})
              </span>
            )}
          </p>
          <MinimalTiptapThree
            value={editor.update.content}
            className=""
            autofocus={false}
            editable={false}
            editorClassName=""
            editorContentClassName=""
          />
        </div>
      ) : null}

      <ConfirmDialog
        open={editor.unsavedOpen}
        title="$ discard"
        description="you have unsaved changes. leave anyway?"
        onConfirm={editor.handleConfirmDiscard}
        onCancel={editor.handleCancelDiscard}
      />
    </>
  );
}
