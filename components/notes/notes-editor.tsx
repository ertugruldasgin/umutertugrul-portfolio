"use client";

import MinimalTiptapThree from "@/components/ui/minimal-tiptap/components/custom/minimal-tiptap-three";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@radix-ui/react-icons";
import { NotesBreadcrumb } from "./notes-breadcrumb";
import type { NoteItem } from "./types";
import type { Content } from "@tiptap/react";

interface NotesEditorProps {
  note: NoteItem;
  folderPath: NoteItem[];
  isOwner: boolean;
  saving: boolean;
  hasChanges: boolean;
  onBack: () => void;
  onNavigateFolder: (folder: NoteItem) => void;
  onTitleChange: (title: string, noteId: string) => void;
  onContentChange: (content: Content) => void;
  onSave: () => void;
}

export function NotesEditor({
  note,
  folderPath,
  isOwner,
  saving,
  hasChanges,
  onBack,
  onNavigateFolder,
  onTitleChange,
  onContentChange,
  onSave,
}: NotesEditorProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col p-2">
      <div className="flex flex-col flex-1 md:border border-primary rounded-xl overflow-hidden">
        {/* header */}
        <div className="flex items-center gap-2 px-2 md:px-4 py-4">
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <NotesBreadcrumb
              folderPath={folderPath}
              currentFolder={null}
              activeNote={note}
              isOwner={isOwner}
              onNavigateRoot={onBack}
              onNavigateFolder={onNavigateFolder}
              onTitleChange={onTitleChange}
            />
          </div>

          {isOwner && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSave}
              disabled={saving || !hasChanges}
              className="text-background hover:text-background hover:cursor-pointer rounded-lg bg-primary hover:bg-primary-hover p-1.5 sm:p-2.5"
            >
              {saving ? (
                <span className="size-4 border-2 border-subtle border-t-primary rounded-full animate-spin" />
              ) : (
                <div className="flex flex-row flex-1 gap-2 items-center">
                  <CheckIcon className="size-4" />
                  <p className="hidden sm:block ml-1">save</p>
                </div>
              )}
            </Button>
          )}
        </div>

        {/* editor */}
        <div className="flex-1 overflow-auto px-2 md:px-4 py-4 scrollbar-hide">
          <div className="w-full max-w-3xl mx-auto">
            <MinimalTiptapThree
              value={note.content}
              onChange={onContentChange}
              className="w-full"
              editorContentClassName=""
              output="html"
              placeholder="..."
              autofocus={true}
              editable={isOwner}
              editorClassName=""
            />
          </div>
        </div>
      </div>
    </div>
  );
}
