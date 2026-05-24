import { Button } from "@/components/ui/button";
import { PlusIcon, FileTextIcon } from "@radix-ui/react-icons";
import { FolderPlus, Folder, Trash2 } from "lucide-react";
import type { NoteItem } from "./types";

interface NotesFinderProps {
  folders: NoteItem[];
  notes: NoteItem[];
  isOwner: boolean;
  onOpenFolder: (folder: NoteItem) => void;
  onOpenNote: (note: NoteItem) => void;
  onCreateFolder: () => void;
  onCreateNote: () => void;
  onDelete: (id: string, isFolder: boolean) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function NotesFinder({
  folders,
  notes,
  isOwner,
  onOpenFolder,
  onOpenNote,
  onCreateFolder,
  onCreateNote,
  onDelete,
}: NotesFinderProps) {
  return (
    <>
      {/* actions */}
      {isOwner && (
        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            onClick={onCreateFolder}
            className="hover:cursor-pointer rounded-lg hover:bg-primary-hover px-1.5 sm:px-2.5"
          >
            <FolderPlus className="size-4" />
            <span className="hidden sm:block ml-1">Folder</span>
          </Button>
          <Button
            size="sm"
            onClick={onCreateNote}
            className="hover:cursor-pointer rounded-lg hover:bg-primary-hover px-1.5 sm:px-2.5"
          >
            <PlusIcon className="size-4" />
            <span className="hidden sm:block ml-1">New</span>
          </Button>
        </div>
      )}

      {/* list */}
      <div className="flex flex-col gap-1">
        {folders.map((f) => (
          <button
            key={f.id}
            onClick={() => onOpenFolder(f)}
            className="flex items-center gap-3 md:px-3 py-2.5 rounded-lg hover:bg-surface transition-colors text-left cursor-pointer group"
          >
            <Folder className="size-4 sm:size-5 text-primary/60 group-hover:text-primary transition-colors shrink-0" />
            <span className="font-mono text-sm sm:text-base md:text-lg text-foreground group-hover:text-primary transition-colors truncate flex-1">
              {f.title}
            </span>
            <span className="text-xs sm:text-sm text-subtle/40 font-mono shrink-0">
              {formatDate(f.updated_at)}
            </span>
            {isOwner && (
              <Trash2
                className="size-4 text-subtle/40 hover:text-danger transition-colors shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(f.id, true);
                }}
              />
            )}
          </button>
        ))}

        {notes.map((n) => (
          <button
            key={n.id}
            onClick={() => onOpenNote(n)}
            className="flex items-center gap-3 md:px-3 py-2.5 rounded-lg hover:bg-surface transition-colors text-left cursor-pointer group"
          >
            <FileTextIcon className="size-4 sm:size-5 text-subtle/60 group-hover:text-primary transition-colors shrink-0" />
            <span className="font-mono text-sm sm:text-base md:text-lg text-foreground group-hover:text-primary transition-colors truncate flex-1">
              {n.title}
            </span>
            <span className="text-xs sm:text-sm text-subtle/40 font-mono shrink-0">
              {formatDate(n.updated_at)}
            </span>
            {isOwner && (
              <Trash2
                className="size-4 text-subtle/40 hover:text-danger transition-colors shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(n.id, false);
                }}
              />
            )}
          </button>
        ))}

        {folders.length === 0 && notes.length === 0 && (
          <p className="text-subtle font-mono text-sm sm:text-base py-8 text-center">
            empty directory.
          </p>
        )}
      </div>
    </>
  );
}
