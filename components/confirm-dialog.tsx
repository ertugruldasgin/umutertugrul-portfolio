"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent className="sm:max-w-sm bg-card rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-mono text-sm">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="font-mono text-xs text-subtle">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            onClick={onCancel}
            className="hover:cursor-pointer bg-transparent border-none hover:bg-primary-hover/10 rounded-lg!"
          >
            cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="hover:cursor-pointer text-foreground! rounded-lg! bg-danger! hover:bg-danger/80!"
          >
            delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
