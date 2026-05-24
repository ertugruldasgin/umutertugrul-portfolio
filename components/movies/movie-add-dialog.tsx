"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CameraIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";
import { createClient } from "@/lib/supabase/client";
import { TerminalCard } from "@/components/terminal-card";
import { Input } from "@/components/ui/input";
import { COUNTRY_NAMES } from "@/lib/countries";
import Image from "next/image";
import type { Movie } from "./types";

interface MovieAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  countryCode: string;
  existingCount: number;
  onAdded: (movie: Movie) => void;
}

export function MovieAddDialog({
  open,
  onOpenChange,
  countryCode,
  existingCount,
  onAdded,
}: MovieAddDialogProps) {
  const [title, setTitle] = useState("");
  const [director, setDirector] = useState("");
  const [year, setYear] = useState("");
  const [type, setType] = useState<"movie" | "series">("movie");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setTitle("");
    setDirector("");
    setYear("");
    setType("movie");
    setPosterFile(null);
    setPosterPreview(null);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handlePosterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  };

  const handleAdd = async () => {
    if (!title.trim() || adding) return;
    setAdding(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setAdding(false);
      return;
    }

    let posterUrl: string | null = null;

    if (posterFile) {
      const ext = posterFile.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("movie-posters")
        .upload(path, posterFile);

      if (!error) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("movie-posters").getPublicUrl(path);
        posterUrl = publicUrl;
      }
    }

    const { data } = await supabase
      .from("movies")
      .insert({
        title: title.trim(),
        director: director.trim() || null,
        year: year ? parseInt(year) : null,
        type,
        country_code: countryCode,
        rank_in_country: existingCount + 1,
        poster_url: posterUrl,
        user_id: user.id,
      })
      .select()
      .single();

    if (data) {
      onAdded(data as Movie);
      reset();
      onOpenChange(false);
    }
    setAdding(false);
  };

  const countryName = COUNTRY_NAMES[countryCode] || countryCode;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogOverlay />
      <DialogContent className="sm:max-w-md p-0 bg-transparent shadow-none! rounded-xl! [&>button]:hidden">
        <VisuallyHidden.Root>
          <DialogTitle>Add movie</DialogTitle>
        </VisuallyHidden.Root>

        <TerminalCard
          title={`$ ${countryName}`}
          className="border-primary text-primary bg-background"
        >
          <div className="flex flex-row gap-4">
            <div className="flex flex-col gap-2 shrink-0">
              <div className="relative group w-30">
                {posterPreview ? (
                  <Image
                    width={144}
                    height={216}
                    src={posterPreview}
                    alt="preview"
                    className="w-30 aspect-2/3 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-30 aspect-2/3 bg-surface rounded-lg flex items-center justify-center">
                    <span className="text-2xl text-subtle/30 font-serif">
                      {title[0]}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg cursor-pointer"
                >
                  <CameraIcon className="size-5 text-foreground" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePosterSelect}
                />
              </div>

              <div className="flex gap-2">
                {(["movie", "series"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`px-2 py-1 rounded-md text-xs font-mono cursor-pointer transition-colors ${
                      type === t
                        ? "bg-primary text-background"
                        : "bg-surface text-subtle hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col flex-1 min-w-0 gap-2.5 justify-center">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-subtle font-mono">title</span>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-8 w-full text-sm font-mono bg-transparent"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-subtle font-mono">director</span>
                <Input
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  className="h-8 text-sm font-mono bg-transparent"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-subtle font-mono">year</span>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="h-8 w-24 text-sm font-mono bg-transparent"
                />
              </label>

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
                  onClick={handleAdd}
                  disabled={!title.trim() || adding}
                  className="hover:cursor-pointer rounded-lg bg-primary hover:bg-primary-hover px-2.5 font-mono"
                >
                  {adding ? <Loader2 className="size-4 animate-spin" /> : "add"}
                </Button>
              </div>
            </div>
          </div>
        </TerminalCard>
      </DialogContent>
    </Dialog>
  );
}
