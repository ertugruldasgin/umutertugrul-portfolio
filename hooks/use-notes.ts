import { useState, useEffect, useRef, useCallback } from "react";
import { Content } from "@tiptap/react";
import { createClient } from "@/lib/supabase/client";
import type { NoteItem, HistoryState } from "@/components/notes/types";

interface UseNotesOptions {
  initialItems: NoteItem[];
  initialNote: NoteItem | null;
  initialFolderId: string | null;
  isOwner: boolean;
}

export function useNotes({
  initialItems,
  initialNote,
  initialFolderId,
  isOwner,
}: UseNotesOptions) {
  const [items, setItems] = useState<NoteItem[]>(initialItems);
  const [currentFolder, setCurrentFolder] = useState<string | null>(
    initialFolderId,
  );
  const [folderPath, setFolderPath] = useState<NoteItem[]>([]);
  const [activeNote, setActiveNote] = useState<NoteItem | null>(initialNote);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [unsavedOpen, setUnsavedOpen] = useState(false);

  const [promptOpen, setPromptOpen] = useState(false);
  const [promptMode, setPromptMode] = useState<"folder" | "note">("folder");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    isFolder: boolean;
  } | null>(null);

  const latestContent = useRef<Content>("");
  const titleTimeout = useRef<NodeJS.Timeout | null>(null);
  const initialized = useRef(false);
  const pendingAction = useRef<(() => void) | null>(null);
  const itemsRef = useRef<NoteItem[]>(initialItems);
  const hasChangesRef = useRef(false);
  const activeNoteRef = useRef<NoteItem | null>(initialNote);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => {
    hasChangesRef.current = hasChanges;
  }, [hasChanges]);
  useEffect(() => {
    activeNoteRef.current = activeNote;
  }, [activeNote]);

  // set initial history state
  useEffect(() => {
    const state: HistoryState = initialNote
      ? { type: "note", id: initialNote.id }
      : initialFolderId
        ? { type: "folder", id: initialFolderId }
        : { type: "root" };
    window.history.replaceState(state, "", window.location.href);
  }, [initialNote, initialFolderId]);

  const fetchItems = useCallback(async (parentId: string | null) => {
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
  }, []);

  const fetchNoteById = useCallback(
    async (id: string): Promise<NoteItem | null> => {
      const supabase = createClient();
      const { data } = await supabase
        .from("notes")
        .select("*")
        .eq("id", id)
        .single();
      return data as NoteItem | null;
    },
    [],
  );

  const closeNote = useCallback(() => {
    setActiveNote(null);
    setHasChanges(false);
    latestContent.current = "";
    initialized.current = false;
  }, []);

  const navigateToFolder = useCallback(
    async (folder: NoteItem | null) => {
      if (folder === null) {
        setCurrentFolder(null);
        setFolderPath([]);
        await fetchItems(null);
        window.history.pushState(
          { type: "root" } as HistoryState,
          "",
          "/notes",
        );
      } else {
        setCurrentFolder(folder.id);
        setFolderPath((prev) => {
          const existingIndex = prev.findIndex((f) => f.id === folder.id);
          if (existingIndex >= 0) return prev.slice(0, existingIndex + 1);
          return [...prev, folder];
        });
        await fetchItems(folder.id);
        window.history.pushState(
          { type: "folder", id: folder.id } as HistoryState,
          "",
          `/notes?f=${folder.id}`,
        );
      }
    },
    [fetchItems],
  );

  const openNote = useCallback((note: NoteItem) => {
    initialized.current = false;
    setActiveNote(note);
    window.history.pushState(
      { type: "note", id: note.id } as HistoryState,
      "",
      `/notes?n=${note.id}`,
    );
  }, []);

  const handleContentChange = useCallback((content: Content) => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    latestContent.current = content;
    setHasChanges(true);
  }, []);

  const handleTitleChange = useCallback((newTitle: string, noteId: string) => {
    setActiveNote((prev) => (prev ? { ...prev, title: newTitle } : null));
    if (titleTimeout.current) clearTimeout(titleTimeout.current);
    titleTimeout.current = setTimeout(async () => {
      const supabase = createClient();
      await supabase.from("notes").update({ title: newTitle }).eq("id", noteId);
    }, 1000);
  }, []);

  const handleSave = useCallback(async () => {
    const note = activeNoteRef.current;
    if (!note || !latestContent.current || saving || !hasChangesRef.current)
      return;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("notes")
      .update({
        content: latestContent.current as string,
        updated_at: new Date().toISOString(),
      })
      .eq("id", note.id);
    setHasChanges(false);
    setSaving(false);
  }, [saving]);

  const handleBack = useCallback(() => {
    if (hasChangesRef.current) {
      pendingAction.current = () => {
        closeNote();
        window.history.back();
      };
      setUnsavedOpen(true);
      return;
    }
    closeNote();
    window.history.back();
  }, [closeNote]);

  const guardNavigation = useCallback((action: () => void) => {
    if (hasChangesRef.current) {
      pendingAction.current = action;
      setUnsavedOpen(true);
      return true;
    }
    return false;
  }, []);

  const handleConfirmDiscard = useCallback(() => {
    setUnsavedOpen(false);
    pendingAction.current?.();
    pendingAction.current = null;
  }, []);

  const handleCancelDiscard = useCallback(() => {
    setUnsavedOpen(false);
    pendingAction.current = null;
  }, []);

  // CRUD

  const handlePromptConfirm = useCallback(
    async (name: string) => {
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
          openNote(data as NoteItem);
        }
      }
    },
    [promptMode, currentFolder, openNote],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setConfirmOpen(false);
    const supabase = createClient();
    await supabase.from("notes").delete().eq("id", deleteTarget.id);
    setItems((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    if (activeNoteRef.current?.id === deleteTarget.id) closeNote();
    setDeleteTarget(null);
  }, [deleteTarget, closeNote]);

  const openCreateFolder = useCallback(() => {
    setPromptMode("folder");
    setPromptOpen(true);
  }, []);

  const openCreateNote = useCallback(() => {
    setPromptMode("note");
    setPromptOpen(true);
  }, []);

  const requestDelete = useCallback((id: string, isFolder: boolean) => {
    setDeleteTarget({ id, isFolder });
    setConfirmOpen(true);
  }, []);

  const dismissPrompt = useCallback(() => setPromptOpen(false), []);
  const dismissConfirm = useCallback(() => {
    setConfirmOpen(false);
    setDeleteTarget(null);
  }, []);

  // ctrl+s
  useEffect(() => {
    if (!activeNote) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // beforeunload
  useEffect(() => {
    if (!activeNote || !hasChanges) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeNote, hasChanges]);

  // popstate
  useEffect(() => {
    const handlePopState = async (e: PopStateEvent) => {
      const state = e.state as HistoryState | null;

      if (hasChangesRef.current && activeNoteRef.current) {
        window.history.pushState(
          { type: "note", id: activeNoteRef.current.id } as HistoryState,
          "",
          `/notes?n=${activeNoteRef.current.id}`,
        );
        pendingAction.current = () => {
          closeNote();
          window.history.back();
        };
        setUnsavedOpen(true);
        return;
      }

      if (!state || state.type === "root") {
        setActiveNote(null);
        setCurrentFolder(null);
        setFolderPath([]);
        initialized.current = false;
        await fetchItems(null);
      } else if (state.type === "folder") {
        setActiveNote(null);
        setCurrentFolder(state.id);
        initialized.current = false;
        await fetchItems(state.id);
      } else if (state.type === "note") {
        let note = itemsRef.current.find((i) => i.id === state.id) || null;
        if (!note) note = await fetchNoteById(state.id);
        if (note) {
          initialized.current = false;
          setActiveNote(note);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [fetchItems, fetchNoteById, closeNote]);

  const folders = items.filter((i) => i.is_folder);
  const notes = items.filter((i) => !i.is_folder);

  return {
    // state
    items,
    folders,
    notes,
    currentFolder,
    folderPath,
    activeNote,
    isOwner,
    saving,
    hasChanges,
    unsavedOpen,
    promptOpen,
    promptMode,
    confirmOpen,
    deleteTarget,

    // navigation
    navigateToFolder,
    openNote,
    closeNote,
    handleBack,
    guardNavigation,

    // editing
    handleContentChange,
    handleTitleChange,
    handleSave,

    // CRUD
    openCreateFolder,
    openCreateNote,
    handlePromptConfirm,
    handleDeleteConfirm,
    requestDelete,
    dismissPrompt,
    dismissConfirm,

    handleConfirmDiscard,
    handleCancelDiscard,
  };
}
