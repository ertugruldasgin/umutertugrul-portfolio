import { useState, useEffect, useRef } from "react";
import { Content } from "@tiptap/react";
import { createClient } from "@/lib/supabase/client";

export interface NowUpdate {
  id: string;
  content: string;
  location: string | null;
  created_at: string;
  user_id: string | null;
}

export function useNowEditor(initialUpdate: NowUpdate | null) {
  const [update, setUpdate] = useState<NowUpdate | null>(initialUpdate);
  const [draft, setDraft] = useState<Content>("");
  const [draftLocation, setDraftLocation] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [unsavedOpen, setUnsavedOpen] = useState(false);

  const pendingAction = useRef<(() => void) | null>(null);

  const handleEdit = () => {
    setDraft(update?.content ?? "");
    setDraftLocation(update?.location ?? "");
    setHasChanges(false);
    setIsEditing(true);
  };

  const handleDraftChange = (content: Content) => {
    setDraft(content);
    setHasChanges(true);
  };

  const handleLocationChange = (location: string) => {
    setDraftLocation(location);
    setHasChanges(true);
  };

  const confirmCancel = () => {
    if (hasChanges) {
      pendingAction.current = () => {
        setIsEditing(false);
        setHasChanges(false);
      };
      setUnsavedOpen(true);
      return;
    }
    setIsEditing(false);
  };

  const handleConfirmDiscard = () => {
    setUnsavedOpen(false);
    pendingAction.current?.();
    pendingAction.current = null;
  };

  const handleCancelDiscard = () => {
    setUnsavedOpen(false);
    pendingAction.current = null;
  };

  const handleSave = async () => {
    if (saving || !hasChanges) return;
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const { data } = await supabase
      .from("now_updates")
      .insert({
        content: draft,
        location: draftLocation || null,
        user_id: user.id,
      })
      .select()
      .single();

    if (data) setUpdate(data);
    setIsEditing(false);
    setHasChanges(false);
    setSaving(false);
  };

  useEffect(() => {
    if (!isEditing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  useEffect(() => {
    if (!isEditing || !hasChanges) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isEditing, hasChanges]);

  useEffect(() => {
    if (!isEditing || !hasChanges) return;
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      pendingAction.current = () => window.history.back();
      setUnsavedOpen(true);
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isEditing, hasChanges]);

  return {
    update,
    draft,
    draftLocation,
    isEditing,
    saving,
    hasChanges,
    unsavedOpen,
    handleEdit,
    handleDraftChange,
    handleLocationChange,
    confirmCancel,
    handleConfirmDiscard,
    handleCancelDiscard,
    handleSave,
  };
}
