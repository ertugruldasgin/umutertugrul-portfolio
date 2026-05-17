"use client";

import { PageHeader } from "@/components/page-header";
import { DiagramEditor } from "@/components/diagram-editor";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, CheckIcon, FileIcon } from "@radix-ui/react-icons";
import { FolderPlus, Folder, Trash2 } from "lucide-react";
import { PromptDialog } from "@/components/prompt-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";

export const metada = {
  title: "diagrams",
};

interface DiagramItem {
  id: string;
  title: string;
  elements: any;
  app_state: any;
  files: any;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
  is_folder: boolean;
}

type HistoryState =
  | { type: "root" }
  | { type: "folder"; id: string }
  | { type: "diagram"; id: string };

export default function DiagramsPage() {
  const [items, setItems] = useState<DiagramItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<DiagramItem[]>([]);
  const [activeDiagram, setActiveDiagram] = useState<DiagramItem | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const latestData = useRef<{
    elements: any[];
    appState: any;
    files: any;
  } | null>(null);
  const titleTimeout = useRef<NodeJS.Timeout | null>(null);

  const [promptOpen, setPromptOpen] = useState(false);
  const [promptMode, setPromptMode] = useState<"folder" | "diagram">("folder");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    isFolder: boolean;
  } | null>(null);
  const [unsavedOpen, setUnsavedOpen] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

  const itemsRef = useRef<DiagramItem[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const hasChangesRef = useRef(false);
  useEffect(() => {
    hasChangesRef.current = hasChanges;
  }, [hasChanges]);

  const activeDiagramRef = useRef<DiagramItem | null>(null);
  useEffect(() => {
    activeDiagramRef.current = activeDiagram;
  }, [activeDiagram]);

  const fetchItems = useCallback(async (parentId: string | null) => {
    const supabase = createClient();
    let query = supabase
      .from("diagrams")
      .select("*")
      .order("is_folder", { ascending: false })
      .order("updated_at", { ascending: false });

    if (parentId === null) {
      query = query.is("parent_id", null);
    } else {
      query = query.eq("parent_id", parentId);
    }

    const { data } = await query;
    if (data) setItems(data as DiagramItem[]);
  }, []);

  const fetchDiagramById = useCallback(
    async (id: string): Promise<DiagramItem | null> => {
      const supabase = createClient();
      const { data } = await supabase
        .from("diagrams")
        .select("*")
        .eq("id", id)
        .single();
      return data as DiagramItem | null;
    },
    [],
  );

  // initial load + set history state
  useEffect(() => {
    const init = async () => {
      const supabase = createClient();

      const { data: list } = await supabase
        .from("diagrams")
        .select("*")
        .is("parent_id", null)
        .order("is_folder", { ascending: false })
        .order("updated_at", { ascending: false });

      if (list) setItems(list as DiagramItem[]);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setIsOwner(true);

      const params = new URLSearchParams(window.location.search);
      const diagramId = params.get("d");
      const folderId = params.get("f");

      if (diagramId && list) {
        const diagram = (list as DiagramItem[]).find((i) => i.id === diagramId);
        if (diagram) {
          setActiveDiagram(diagram);
        } else {
          const fetched = await supabase
            .from("diagrams")
            .select("*")
            .eq("id", diagramId)
            .single();
          if (fetched.data) setActiveDiagram(fetched.data as DiagramItem);
        }
      } else if (folderId) {
        setCurrentFolder(folderId);
        await fetchItems(folderId);
      }

      window.history.replaceState(
        diagramId
          ? { type: "diagram", id: diagramId }
          : folderId
            ? { type: "folder", id: folderId }
            : { type: "root" },
        "",
        window.location.href,
      );
    };

    init();
  }, [fetchItems]);

  const navigateToFolder = useCallback(
    async (folder: DiagramItem | null) => {
      if (folder === null) {
        setCurrentFolder(null);
        setFolderPath([]);
        await fetchItems(null);
        window.history.pushState(
          { type: "root" } as HistoryState,
          "",
          "/diagrams",
        );
      } else {
        setCurrentFolder(folder.id);
        setFolderPath((prev) => {
          const existingIndex = prev.findIndex((f) => f.id === folder.id);
          if (existingIndex >= 0) {
            return prev.slice(0, existingIndex + 1);
          }
          return [...prev, folder];
        });
        await fetchItems(folder.id);
        window.history.pushState(
          { type: "folder", id: folder.id } as HistoryState,
          "",
          `/diagrams?f=${folder.id}`,
        );
      }
    },
    [fetchItems],
  );

  const openDiagram = useCallback((diagram: DiagramItem) => {
    setActiveDiagram(diagram);
    setHasChanges(false);
    latestData.current = null;
    window.history.pushState(
      { type: "diagram", id: diagram.id } as HistoryState,
      "",
      `/diagrams?d=${diagram.id}`,
    );
  }, []);

  const closeDiagram = useCallback(() => {
    setActiveDiagram(null);
    setHasChanges(false);
    latestData.current = null;
  }, []);

  const handlePromptConfirm = async (name: string) => {
    setPromptOpen(false);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (promptMode === "folder") {
      const { data } = await supabase
        .from("diagrams")
        .insert({
          title: name,
          elements: [],
          app_state: {},
          files: {},
          user_id: user.id,
          parent_id: currentFolder,
          is_folder: true,
        })
        .select()
        .single();

      if (data) setItems((prev) => [data as DiagramItem, ...prev]);
    } else {
      const { data } = await supabase
        .from("diagrams")
        .insert({
          title: name,
          elements: [],
          app_state: { viewBackgroundColor: "#f5faff" },
          files: {},
          user_id: user.id,
          parent_id: currentFolder,
          is_folder: false,
        })
        .select()
        .single();

      if (data) {
        setItems((prev) => [...prev, data as DiagramItem]);
        openDiagram(data as DiagramItem);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setConfirmOpen(false);
    const supabase = createClient();
    await supabase.from("diagrams").delete().eq("id", deleteTarget.id);
    setItems((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    if (activeDiagram?.id === deleteTarget.id) closeDiagram();
    setDeleteTarget(null);
  };

  const handleChange = (
    elements: readonly any[],
    appState: any,
    files: any,
  ) => {
    latestData.current = {
      elements: [...elements],
      appState: {
        viewBackgroundColor: appState.viewBackgroundColor,
        zoom: appState.zoom,
        scrollX: appState.scrollX,
        scrollY: appState.scrollY,
      },
      files,
    };
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!activeDiagram || !latestData.current || saving || !hasChanges) return;
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("diagrams")
      .update({
        elements: latestData.current.elements,
        app_state: latestData.current.appState,
        files: latestData.current.files,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeDiagram.id);
    setHasChanges(false);
    setSaving(false);
  };

  const handleBack = () => {
    if (hasChanges) {
      pendingAction.current = () => {
        closeDiagram();
        window.history.back();
      };
      setUnsavedOpen(true);
      return;
    }
    closeDiagram();
    window.history.back();
  };

  // ctrl+s save
  useEffect(() => {
    if (!activeDiagram) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // beforeunload for tab close
  useEffect(() => {
    if (!activeDiagram || !hasChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeDiagram, hasChanges]);

  // unified popstate: navigation + unsaved guard
  useEffect(() => {
    const handlePopState = async (e: PopStateEvent) => {
      const state = e.state as HistoryState | null;

      if (hasChangesRef.current && activeDiagramRef.current) {
        window.history.pushState(
          {
            type: "diagram",
            id: activeDiagramRef.current.id,
          } as HistoryState,
          "",
          `/diagrams?d=${activeDiagramRef.current.id}`,
        );
        pendingAction.current = () => {
          closeDiagram();
          window.history.back();
        };
        setUnsavedOpen(true);
        return;
      }

      if (!state || state.type === "root") {
        setActiveDiagram(null);
        setCurrentFolder(null);
        setFolderPath([]);
        await fetchItems(null);
      } else if (state.type === "folder") {
        setActiveDiagram(null);
        setCurrentFolder(state.id);
        await fetchItems(state.id);
      } else if (state.type === "diagram") {
        let diagram = itemsRef.current.find((i) => i.id === state.id) || null;
        if (!diagram) {
          diagram = await fetchDiagramById(state.id);
        }
        if (diagram) {
          setActiveDiagram(diagram);
          setHasChanges(false);
          latestData.current = null;
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [fetchItems, fetchDiagramById, closeDiagram]);

  // fullscreen editor
  if (activeDiagram) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="relative z-10 flex items-center gap-2 px-2 md:px-4 py-2 bg-background">
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex items-center text-base md:text-lg text-subtle whitespace-nowrap">
              <button
                onClick={handleBack}
                className="hover:text-primary transition-colors font-mono cursor-pointer"
              >
                ./diagrams
              </button>
              {folderPath.map((f) => (
                <span key={f.id} className="flex items-center">
                  <span className="select-none">/</span>
                  <button
                    onClick={() => {
                      if (hasChanges) {
                        pendingAction.current = () => {
                          closeDiagram();
                          navigateToFolder(f);
                        };
                        setUnsavedOpen(true);
                      } else {
                        closeDiagram();
                        navigateToFolder(f);
                      }
                    }}
                    className="hover:text-primary transition-colors font-mono cursor-pointer"
                  >
                    {f.title}
                  </button>
                </span>
              ))}
              <span className="select-none">/</span>
              <input
                value={activeDiagram.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setActiveDiagram((prev) =>
                    prev ? { ...prev, title: newTitle } : null,
                  );
                  if (titleTimeout.current) clearTimeout(titleTimeout.current);
                  titleTimeout.current = setTimeout(async () => {
                    const supabase = createClient();
                    await supabase
                      .from("diagrams")
                      .update({ title: newTitle })
                      .eq("id", activeDiagram.id);
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
        <div className="flex-1 relative z-0 overflow-hidden md:mx-2 md:mb-2 border-t md:border border-primary md:rounded-xl">
          <DiagramEditor
            initialData={{
              elements: activeDiagram.elements,
              appState: activeDiagram.app_state,
              files: activeDiagram.files,
            }}
            onChange={handleChange}
            viewMode={!isOwner}
          />
        </div>

        <ConfirmDialog
          open={unsavedOpen}
          title="$ discard"
          description="you have unsaved changes. leave anyway?"
          onConfirm={() => {
            setUnsavedOpen(false);
            pendingAction.current?.();
            pendingAction.current = null;
          }}
          onCancel={() => {
            setUnsavedOpen(false);
            pendingAction.current = null;
          }}
        />
      </div>
    );
  }

  // finder view
  const folders = items.filter((i) => i.is_folder);
  const diagrams = items.filter((i) => !i.is_folder);

  return (
    <div className="flex flex-col gap-6 md:gap-12 flex-1 w-full max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <PageHeader title="diagrams" description="visual thinking space." />
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
              ~/diagrams
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
                setPromptMode("diagram");
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

        {/* diagrams */}
        {diagrams.map((d) => (
          <button
            key={d.id}
            onClick={() => openDiagram(d)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors text-left cursor-pointer group"
          >
            <FileIcon className="size-4 sm:size-5 text-subtle/60 group-hover:text-primary transition-colors shrink-0" />
            <span className="font-mono text-sm sm:text-base md:text-lg text-foreground group-hover:text-primary transition-colors truncate flex-1">
              {d.title}
            </span>
            <span className="text-xs sm:text-sm text-subtle/40 font-mono shrink-0">
              {new Date(d.updated_at).toLocaleDateString("tr-TR", {
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
                  setDeleteTarget({ id: d.id, isFolder: false });
                  setConfirmOpen(true);
                }}
              />
            )}
          </button>
        ))}

        {folders.length === 0 && diagrams.length === 0 && (
          <p className="text-subtle font-mono text-sm sm:text-base py-8 text-center">
            empty directory.
          </p>
        )}
      </div>

      {/* dialogs */}
      <PromptDialog
        open={promptOpen}
        title={promptMode === "folder" ? "$ mkdir" : "$ touch"}
        defaultValue={promptMode === "diagram" ? "untitled" : ""}
        placeholder={promptMode === "folder" ? "folder name" : "diagram name"}
        onConfirm={handlePromptConfirm}
        onCancel={() => setPromptOpen(false)}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="$ rm -rf"
        description={
          deleteTarget?.isFolder
            ? "this will delete the folder and everything inside. are you sure?"
            : "delete this diagram?"
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
