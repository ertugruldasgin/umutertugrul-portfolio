"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PromptDialogProps {
  open: boolean;
  title: string;
  defaultValue?: string;
  placeholder?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function PromptDialog({
  open,
  title,
  defaultValue = "",
  placeholder,
  onConfirm,
  onCancel,
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = () => {
    if (value.trim()) onConfirm(value.trim());
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) {
          setValue(defaultValue);
        } else {
          onCancel();
        }
      }}
    >
      <DialogContent className="sm:max-w-sm bg-card rounded-lg">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm text-subtle">
            {title}
          </DialogTitle>
        </DialogHeader>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={placeholder}
          className="w-full bg-transparent border border-border rounded-md px-3 py-2 text-sm font-mono text-foreground placeholder:text-subtle/50 outline-none focus:border-primary transition-colors"
        />
        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="hover:cursor-pointer rounded-lg hover:bg-primary-hover/10"
          >
            cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="hover:cursor-pointer rounded-lg hover:bg-primary-hover!"
          >
            create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
