"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@radix-ui/react-icons";

interface BlogEditorBarProps {
  isOwner: boolean;
  isEditing: boolean;
  saving: boolean;
  hasChanges: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onBackClick: (e: React.MouseEvent) => void;
}

export function BlogEditorBar({
  isOwner,
  isEditing,
  saving,
  hasChanges,
  onEdit,
  onSave,
  onCancel,
  onBackClick,
}: BlogEditorBarProps) {
  return (
    <div className="flex items-center justify-between">
      <Link
        href="/blog"
        onClick={onBackClick}
        className="text-subtle hover:text-primary transition-colors font-mono text-sm flex items-center gap-1"
      >
        ../
      </Link>

      {isOwner && !isEditing && (
        <Button
          size="sm"
          onClick={onEdit}
          className="hover:cursor-pointer rounded-lg bg-primary hover:bg-primary-hover px-2.5"
        >
          Edit
        </Button>
      )}

      {isOwner && isEditing && (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="hover:cursor-pointer rounded-lg hover:bg-primary-hover/10"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={saving || !hasChanges}
            className="hover:cursor-pointer rounded-lg bg-primary hover:bg-primary-hover px-2.5"
          >
            <CheckIcon className="size-4 mr-1" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
}
