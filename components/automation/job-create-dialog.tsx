"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "@radix-ui/react-icons";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VisuallyHidden } from "radix-ui";
import { createClient } from "@/lib/supabase/client";
import { JOB_TEMPLATES } from "./types";
import { TerminalCard } from "../terminal-card";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

interface JobCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function buildDefaultFields(templateIndex: number): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(
    JOB_TEMPLATES[templateIndex].defaultConfig,
  )) {
    fields[key] = JSON.stringify(value);
  }
  return fields;
}

export function JobCreateDialog({ open, onOpenChange }: JobCreateDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [customName, setCustomName] = useState("");
  const [configFields, setConfigFields] = useState<Record<string, string>>(() =>
    buildDefaultFields(0),
  );
  const [submitting, setSubmitting] = useState(false);

  const template = JOB_TEMPLATES[selectedTemplate];

  const handleTemplateChange = (index: number) => {
    setSelectedTemplate(index);
    setConfigFields(buildDefaultFields(index));
    // Radix UI, DropdownMenuItem'a tıklandığında menüyü otomatik kapatır.
    // Ekstra bir state'i false yapmamıza gerek kalmadı.
  };

  const handleConfigChange = (key: string, value: string) => {
    setConfigFields((prev) => ({ ...prev, [key]: value }));
  };

  const buildConfig = (): Record<string, any> | null => {
    try {
      const config: Record<string, any> = {};
      for (const [key, value] of Object.entries(configFields)) {
        config[key] = JSON.parse(value);
      }
      return config;
    } catch {
      return null;
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const config = buildConfig();
    if (!config) return;

    setSubmitting(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return;
    }

    await supabase.from("automation_jobs").insert({
      name: customName.trim() || template.name,
      type: template.type,
      config,
      user_id: user.id,
    });

    setCustomName("");
    setSubmitting(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    setCustomName("");
    setSelectedTemplate(0);
    setConfigFields(buildDefaultFields(0));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogOverlay />
      <DialogContent className="sm:max-w-md p-0 bg-transparent shadow-none! rounded-xl! [&>button]:hidden">
        <VisuallyHidden.Root>
          <DialogTitle>Queue job</DialogTitle>
        </VisuallyHidden.Root>

        <TerminalCard
          title="$ queue"
          className="border-primary text-primary bg-background"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-subtle font-mono">template</span>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between font-mono text-sm h-9 bg-transparent border-border hover:bg-surface hover:cursor-pointer rounded-lg"
                  >
                    {template.name}
                    <ChevronsUpDown className="size-3.5 text-subtle/40" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) p-1 border-border rounded-xl bg-surface"
                  align="start"
                >
                  {JOB_TEMPLATES.map((t, i) => {
                    const isCurrent = selectedTemplate === i;

                    return (
                      <DropdownMenuItem
                        key={t.type}
                        onSelect={() => handleTemplateChange(i)}
                        className={cn(
                          "font-mono flex items-center justify-between cursor-pointer",
                          "px-2 py-1.5 text-sm rounded-lg",
                          "focus:bg-background focus:text-primary hover:bg-background hover:text-primary",
                          isCurrent ? "text-primary" : "text-foreground",
                        )}
                      >
                        <div className="flex flex-col gap-0.5 flex-1">
                          <span>{t.name}</span>
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* name */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-subtle font-mono">name</span>
              <Input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={template.name}
                className="h-9 bg-transparent font-mono text-sm placeholder:text-subtle/30"
              />
            </div>

            {/* config fields */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-subtle font-mono">config</span>
              <div className="flex flex-col gap-1.5">
                {Object.entries(configFields).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-xs text-subtle/60 font-mono w-24 shrink-0 truncate">
                      {key}
                    </span>
                    <Input
                      type="text"
                      value={value}
                      onChange={(e) => handleConfigChange(key, e.target.value)}
                      className="h-7 bg-transparent font-mono text-xs flex-1 placeholder:text-subtle/30"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* actions */}
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="hover:cursor-pointer rounded-lg hover:bg-primary-hover/10 font-mono"
              >
                cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={submitting}
                className="hover:cursor-pointer rounded-lg px-2! bg-primary hover:bg-primary-hover"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <PlayIcon className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </TerminalCard>
      </DialogContent>
    </Dialog>
  );
}
