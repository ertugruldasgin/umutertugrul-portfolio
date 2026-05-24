"use client";

import { PageHeader } from "@/components/page-header";
import { PromptDialog } from "@/components/prompt-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useNotes } from "@/hooks/use-notes";
import { NotesBreadcrumb } from "@/components/notes/notes-breadcrumb";
import { NotesFinder } from "@/components/notes/notes-finder";
import { NotesEditor } from "@/components/notes/notes-editor";
import type { NoteItem } from "@/components/notes/types";

interface NotesContentProps {
  initialItems: NoteItem[];
  initialNote: NoteItem | null;
  initialFolderId: string | null;
  isOwner: boolean;
}

export function NotesContent({
  initialItems,
  initialNote,
  initialFolderId,
  isOwner,
}: NotesContentProps) {
  const n = useNotes({ initialItems, initialNote, initialFolderId, isOwner });

  // fullscreen editor
  if (n.activeNote) {
    return (
      <>
        <NotesEditor
          note={n.activeNote}
          folderPath={n.folderPath}
          isOwner={isOwner}
          saving={n.saving}
          hasChanges={n.hasChanges}
          onBack={n.handleBack}
          onNavigateFolder={(f) => {
            const guarded = n.guardNavigation(() => {
              n.closeNote();
              n.navigateToFolder(f);
            });
            if (!guarded) {
              n.closeNote();
              n.navigateToFolder(f);
            }
          }}
          onTitleChange={n.handleTitleChange}
          onContentChange={n.handleContentChange}
          onSave={n.handleSave}
        />

        <ConfirmDialog
          open={n.unsavedOpen}
          title="$ discard"
          description="you have unsaved changes. leave anyway?"
          onConfirm={n.handleConfirmDiscard}
          onCancel={n.handleCancelDiscard}
        />
      </>
    );
  }

  // finder view
  return (
    <div className="flex flex-col gap-6 md:gap-12 flex-1 w-full max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <PageHeader title="notes" description="a place to think." />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <NotesBreadcrumb
            folderPath={n.folderPath}
            currentFolder={n.currentFolder}
            onNavigateRoot={() => n.navigateToFolder(null)}
            onNavigateFolder={n.navigateToFolder}
          />
        </div>
      </div>

      <NotesFinder
        folders={n.folders}
        notes={n.notes}
        isOwner={isOwner}
        onOpenFolder={n.navigateToFolder}
        onOpenNote={n.openNote}
        onCreateFolder={n.openCreateFolder}
        onCreateNote={n.openCreateNote}
        onDelete={n.requestDelete}
      />

      <PromptDialog
        open={n.promptOpen}
        title={n.promptMode === "folder" ? "$ mkdir" : "$ touch"}
        defaultValue={n.promptMode === "note" ? "untitled" : ""}
        placeholder={n.promptMode === "folder" ? "folder name" : "note name"}
        onConfirm={n.handlePromptConfirm}
        onCancel={n.dismissPrompt}
      />

      <ConfirmDialog
        open={n.confirmOpen}
        title="$ rm -rf"
        description={
          n.deleteTarget?.isFolder
            ? "this will delete the folder and everything inside. are you sure?"
            : "delete this note?"
        }
        onConfirm={n.handleDeleteConfirm}
        onCancel={n.dismissConfirm}
      />
    </div>
  );
}
