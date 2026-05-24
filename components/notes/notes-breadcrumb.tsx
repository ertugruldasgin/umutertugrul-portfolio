import type { NoteItem } from "./types";

interface NotesBreadcrumbProps {
  folderPath: NoteItem[];
  currentFolder: string | null;
  activeNote?: NoteItem | null;
  isOwner?: boolean;
  onNavigateRoot: () => void;
  onNavigateFolder: (folder: NoteItem) => void;
  onTitleChange?: (title: string, noteId: string) => void;
}

export function NotesBreadcrumb({
  folderPath,
  currentFolder,
  activeNote,
  isOwner,
  onNavigateRoot,
  onNavigateFolder,
  onTitleChange,
}: NotesBreadcrumbProps) {
  if (activeNote) {
    return (
      <div className="flex items-center text-base md:text-lg text-subtle whitespace-nowrap">
        <button
          onClick={onNavigateRoot}
          className="hover:text-primary transition-colors font-mono cursor-pointer"
        >
          ./notes
        </button>
        {folderPath.map((f) => (
          <span key={f.id} className="flex items-center">
            <span className="select-none">/</span>
            <button
              onClick={() => onNavigateFolder(f)}
              className="hover:text-primary transition-colors font-mono cursor-pointer"
            >
              {f.title}
            </button>
          </span>
        ))}
        <span className="select-none">/</span>
        <input
          value={activeNote.title}
          onChange={(e) => onTitleChange?.(e.target.value, activeNote.id)}
          className="text-base md:text-lg bg-transparent text-foreground font-mono border-b border-transparent hover:border-border focus:border-primary outline-none transition-colors min-w-20"
          disabled={!isOwner}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center text-base md:text-lg font-mono text-subtle whitespace-nowrap">
      <button
        onClick={onNavigateRoot}
        className={`hover:text-primary-hover hover:cursor-pointer transition-colors ${
          currentFolder === null
            ? "text-foreground"
            : "text-subtle hover:text-primary"
        }`}
      >
        ~/notes
      </button>
      {folderPath.map((f, i) => {
        const isLast = i === folderPath.length - 1;
        return (
          <span key={f.id} className="flex items-center">
            <span className="select-none">/</span>
            <button
              onClick={() => onNavigateFolder(f)}
              className={`flex items-center hover:cursor-pointer transition-colors ${
                isLast ? "text-foreground" : "text-subtle hover:text-primary"
              }`}
            >
              {f.title}
            </button>
          </span>
        );
      })}
    </div>
  );
}
