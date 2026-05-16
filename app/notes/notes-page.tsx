"use client";

import { PageHeader } from "@/components/page-header";
import MinimalTiptapThree from "@/components/ui/minimal-tiptap/components/custom/minimal-tiptap-three";
import { createClient } from "@/lib/supabase/client";
import { Content } from "@tiptap/react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, CheckIcon, FileTextIcon } from "@radix-ui/react-icons";
import { FolderPlus, Folder, Trash2 } from "lucide-react";
import { PromptDialog } from "@/components/prompt-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface NoteItem {
  id: string;
  title: string;
  content: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
  is_folder: boolean;
}

export default function NotesPage() {
  const [items, setItems] = useState<NoteItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<NoteItem[]>([]);
  const [activeNote, setActiveNote] = useState<NoteItem | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const latestContent = useRef<Content>("");
  const titleTimeout = useRef<NodeJS.Timeout | null>(null);

  const [promptOpen, setPromptOpen] = useState(false);
  const [promptMode, setPromptMode] = useState<"folder" | "note">("folder");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    isFolder: boolean;
  } | null>(null);

  const fetchItems = async (parentId: string | null) => {
    const supabase = createClient();
    let query = supabase
      .from("notes")
      .select("*")
      .order("is_folder", { ascending: false })
      .order("updated_at", { ascending: false });

    if (parentId === null) {
      query = query.is("parent_id", null);
    } else {
      query = query.eq("parent_id", parentId);
    }

    const { data } = await query;
    if (data) setItems(data as NoteItem[]);
  };

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();

      const { data: list } = await supabase
        .from("notes")
        .select("*")
        .is("parent_id", null)
        .order("is_folder", { ascending: false })
        .order("updated_at", { ascending: false });

      if (list) setItems(list as NoteItem[]);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setIsOwner(true);
    };

    init();
  }, []);

  const navigateToFolder = async (folder: NoteItem | null) => {
    if (folder === null) {
      setCurrentFolder(null);
      setFolderPath([]);
      await fetchItems(null);
    } else {
      setCurrentFolder(folder.id);
      const existingIndex = folderPath.findIndex((f) => f.id === folder.id);
      if (existingIndex >= 0) {
        setFolderPath(folderPath.slice(0, existingIndex + 1));
      } else {
        setFolderPath([...folderPath, folder]);
      }
      await fetchItems(folder.id);
    }
  };

  const handlePromptConfirm = async (name: string) => {
    setPromptOpen(false);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (promptMode === "folder") {
      const { data } = await supabase
        .from("notes")
        .insert({
          title: name,
          content: "",
          user_id: user.id,
          parent_id: currentFolder,
          is_folder: true,
        })
        .select()
        .single();

      if (data) setItems((prev) => [data as NoteItem, ...prev]);
    } else {
      const { data } = await supabase
        .from("notes")
        .insert({
          title: name,
          content: "",
          user_id: user.id,
          parent_id: currentFolder,
          is_folder: false,
        })
        .select()
        .single();

      if (data) {
        setItems((prev) => [...prev, data as NoteItem]);
        setActiveNote(data as NoteItem);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setConfirmOpen(false);
    const supabase = createClient();
    await supabase.from("notes").delete().eq("id", deleteTarget.id);
    setItems((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    if (activeNote?.id === deleteTarget.id) setActiveNote(null);
    setDeleteTarget(null);
  };

  const handleChange = (content: Content) => {
    latestContent.current = content;
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!activeNote || !latestContent.current) return;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("notes")
      .update({
        content: latestContent.current as string,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeNote.id);
    setHasChanges(false);
    setSaving(false);
  };

  const handleBack = () => {
    setActiveNote(null);
    setHasChanges(false);
    latestContent.current = "";
  };

  // fullscreen editor
  if (activeNote) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col p-2">
        <div className="flex flex-col flex-1 md:border border-primary rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-2 md:px-4 py-4">
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex items-center text-base md:text-lg text-subtle whitespace-nowrap">
                <button
                  onClick={handleBack}
                  className="hover:text-primary transition-colors font-mono cursor-pointer"
                >
                  ./notes
                </button>
                {folderPath.map((f) => (
                  <span key={f.id} className="flex items-center">
                    <span className="select-none">/</span>
                    <button
                      onClick={() => {
                        navigateToFolder(f);
                        handleBack();
                      }}
                      className="hover:text-primary transition-colors font-mono cursor-pointer"
                    >
                      {f.title}
                    </button>
                  </span>
                ))}
                <span className="select-none">/</span>
                <input
                  value={activeNote.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setActiveNote((prev) =>
                      prev ? { ...prev, title: newTitle } : null,
                    );
                    if (titleTimeout.current)
                      clearTimeout(titleTimeout.current);
                    titleTimeout.current = setTimeout(async () => {
                      const supabase = createClient();
                      await supabase
                        .from("notes")
                        .update({ title: newTitle })
                        .eq("id", activeNote.id);
                    }, 1000);
                  }}
                  className="text-base md:text-lg bg-transparent text-foreground font-mono border-b border-transparent hover:border-border focus:border-primary outline-none transition-colors min-w-[80px]"
                  disabled={!isOwner}
                />
              </div>
            </div>

            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
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
          <div className="flex-1 overflow-auto px-2 md:px-4 py-4 scrollbar-hide">
            <div className="w-full max-w-3xl mx-auto">
              <MinimalTiptapThree
                value={activeNote.content}
                onChange={handleChange}
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

  // finder view
  const folders = items.filter((i) => i.is_folder);
  const notes = items.filter((i) => !i.is_folder);

  return (
    <div className="flex flex-col gap-6 md:gap-12 flex-1 w-full max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <PageHeader title="notes" description="a place to think." />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex items-center text-base md:text-lg font-mono text-subtle whitespace-nowrap">
            <button
              onClick={() => navigateToFolder(null)}
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
                    onClick={() => navigateToFolder(f)}
                    className={`flex items-center hover:cursor-pointer transition-colors ${
                      isLast
                        ? "text-foreground"
                        : "text-subtle hover:text-primary"
                    }`}
                  >
                    {f.title}
                  </button>
                </span>
              );
            })}
          </div>
        </div>

        {isOwner && (
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => {
                setPromptMode("folder");
                setPromptOpen(true);
              }}
              className="hover:cursor-pointer rounded-lg hover:bg-primary-hover px-1.5 sm:px-2.5"
            >
              <FolderPlus className="size-4" />
              <span className="hidden sm:block ml-1">Folder</span>
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setPromptMode("note");
                setPromptOpen(true);
              }}
              className="hover:cursor-pointer rounded-lg hover:bg-primary-hover px-1.5 sm:px-2.5"
            >
              <PlusIcon className="size-4" />
              <span className="hidden sm:block ml-1">New</span>
            </Button>
          </div>
        )}
      </div>

      {/* content */}
      <div className="flex flex-col gap-1">
        {/* folders */}
        {folders.map((f) => (
          <button
            key={f.id}
            onClick={() => navigateToFolder(f)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors text-left cursor-pointer group"
          >
            <Folder className="size-4 sm:size-5 text-primary/60 group-hover:text-primary transition-colors shrink-0" />
            <span className="font-mono text-sm sm:text-base md:text-lg text-foreground group-hover:text-primary transition-colors truncate flex-1">
              {f.title}
            </span>

            <span className="text-xs sm:text-sm text-subtle/40 font-mono shrink-0">
              {new Date(f.updated_at).toLocaleDateString("tr-TR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>

            {isOwner && (
              <Trash2
                className="size-4 text-subtle/40 hover:text-danger transition-colors shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget({ id: f.id, isFolder: true });
                  setConfirmOpen(true);
                }}
              />
            )}
          </button>
        ))}

        {/* notes */}
        {notes.map((n) => (
          <button
            key={n.id}
            onClick={() => setActiveNote(n)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors text-left cursor-pointer group"
          >
            <FileTextIcon className="size-4 sm:size-5 text-subtle/60 group-hover:text-primary transition-colors shrink-0" />
            <span className="font-mono text-sm sm:text-base md:text-lg text-foreground group-hover:text-primary transition-colors truncate flex-1">
              {n.title}
            </span>
            <span className="text-xs sm:text-sm text-subtle/40 font-mono shrink-0">
              {new Date(n.updated_at).toLocaleDateString("tr-TR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
            {isOwner && (
              <Trash2
                className="size-4 text-subtle/40 hover:text-danger transition-colors shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget({ id: n.id, isFolder: false });
                  setConfirmOpen(true);
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

      {/* dialogs */}
      <PromptDialog
        open={promptOpen}
        title={promptMode === "folder" ? "$ mkdir" : "$ touch"}
        defaultValue={promptMode === "note" ? "untitled" : ""}
        placeholder={promptMode === "folder" ? "folder name" : "note name"}
        onConfirm={handlePromptConfirm}
        onCancel={() => setPromptOpen(false)}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="$ rm -rf"
        description={
          deleteTarget?.isFolder
            ? "this will delete the folder and everything inside. are you sure?"
            : "delete this note?"
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
