"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { Trash2, GripVertical, Film, Tv, X } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import Image from "next/image";
import { COUNTRY_NAMES } from "@/lib/countries";
import { FlagIcon } from "@/components/movies/flag-icon";
import { MovieAddDialog } from "@/components/movies/movie-add-dialog";
import { createClient } from "@/lib/supabase/client";
import type { Movie } from "@/components/movies/types";

interface CountryPanelProps {
  countryCode: string;
  movies: Movie[];
  isOwner: boolean;
  onClose: () => void;
  onMoviesChange: (updater: (prev: Movie[]) => Movie[]) => void;
}

export function CountryPanel({
  countryCode,
  movies,
  isOwner,
  onClose,
  onMoviesChange,
}: CountryPanelProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [dragItem, setDragItem] = useState<number | null>(null);
  const [savingRank, setSavingRank] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const countryMovies = movies
    .filter((m) => m.country_code === countryCode)
    .sort((a, b) => {
      if (a.rank_in_country != null && b.rank_in_country != null)
        return a.rank_in_country - b.rank_in_country;
      if (a.rank_in_country != null) return -1;
      if (b.rank_in_country != null) return 1;
      return 0;
    });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setConfirmOpen(false);
    const supabase = createClient();
    await supabase.from("movies").delete().eq("id", deleteTarget);
    onMoviesChange((prev) => prev.filter((m) => m.id !== deleteTarget));
    setDeleteTarget(null);
  };

  const handleRatingChange = async (movieId: string, rating: number) => {
    if (!isOwner) return;
    const movie = movies.find((m) => m.id === movieId);
    const newRating = movie?.rating === rating ? 0 : rating;
    const supabase = createClient();
    await supabase
      .from("movies")
      .update({ rating: newRating })
      .eq("id", movieId);
    onMoviesChange((prev) =>
      prev.map((m) => (m.id === movieId ? { ...m, rating: newRating } : m)),
    );
  };

  const handleDragStart = (index: number) => setDragItem(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragItem === null || dragItem === index) return;

    const reordered = [...countryMovies];
    const [moved] = reordered.splice(dragItem, 1);
    reordered.splice(index, 0, moved);

    const updated = reordered.map((m, i) => ({
      ...m,
      rank_in_country: i + 1,
    }));

    onMoviesChange((prev) => {
      const others = prev.filter((m) => m.country_code !== countryCode);
      return [...others, ...updated];
    });
    setDragItem(index);
  };

  const handleDragEnd = async () => {
    setDragItem(null);

    setSavingRank(true);
    const supabase = createClient();
    const ranked = movies
      .filter((m) => m.country_code === countryCode)
      .sort((a, b) => (a.rank_in_country ?? 0) - (b.rank_in_country ?? 0));

    for (const m of ranked) {
      await supabase
        .from("movies")
        .update({ rank_in_country: m.rank_in_country })
        .eq("id", m.id);
    }
    setSavingRank(false);
  };

  const countryName = COUNTRY_NAMES[countryCode] || countryCode;

  return (
    <div className="flex flex-col gap-4">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlagIcon code={countryCode} className="text-lg rounded-sm" />
          <span className="font-mono text-foreground">{countryName}</span>
          <span className="text-xs font-mono text-subtle/60">
            {countryMovies.length} titles
          </span>
        </div>
        <div className="flex items-center gap-2">
          {savingRank && (
            <span className="text-xs text-subtle font-mono animate-pulse">
              saving...
            </span>
          )}
          <button
            onClick={onClose}
            className="text-subtle hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* movie list */}
      <div className="flex flex-col gap-1">
        {countryMovies.map((movie, index) => (
          <div
            key={movie.id}
            draggable={isOwner}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`group flex items-center gap-2.5 px-1.5 py-2 -mx-2 rounded-lg transition-colors ${
              dragItem === index ? "opacity-50 bg-surface" : "hover:bg-surface"
            } ${isOwner ? "cursor-grab active:cursor-grabbing" : ""}`}
          >
            <span className="text-xs font-mono text-subtle/40 w-4 text-right shrink-0">
              {index + 1}
            </span>

            {isOwner && (
              <GripVertical className="size-3.5 text-subtle/20 group-hover:text-subtle/60 shrink-0" />
            )}

            {movie.poster_url ? (
              <Image
                width={36}
                height={54}
                src={movie.poster_url}
                alt={movie.title}
                className="w-9 h-13.5 object-cover rounded-sm shrink-0"
              />
            ) : (
              <div className="w-9 h-13.5 bg-surface rounded-sm shrink-0 flex items-center justify-center">
                {movie.type === "movie" ? (
                  <Film className="size-3.5 text-subtle/30" />
                ) : (
                  <Tv className="size-3.5 text-subtle/30" />
                )}
              </div>
            )}

            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="font-mono text-sm text-foreground truncate">
                {movie.title}
              </span>
              <span className="text-xs text-subtle/50 font-mono truncate">
                {[movie.director, movie.year, movie.type]
                  .filter(Boolean)
                  .join(" - ")}
              </span>
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingChange(movie.id, star)}
                  className={`text-sm sm:text-lg transition-colors ${
                    isOwner ? "cursor-pointer" : "cursor-default"
                  } ${
                    movie.rating != null && star <= movie.rating
                      ? "text-warning"
                      : "text-subtle/20"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            {isOwner && (
              <Trash2
                className="size-3.5 text-subtle/30 hover:text-danger transition-colors shrink-0 cursor-pointer opacity-0 group-hover:opacity-100"
                onClick={() => {
                  setDeleteTarget(movie.id);
                  setConfirmOpen(true);
                }}
              />
            )}
          </div>
        ))}
      </div>

      {isOwner && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAddOpen(true)}
          className="hover:cursor-pointer rounded-lg hover:bg-primary-hover/10 w-full"
        >
          <PlusIcon className="size-4 mr-1" />
          Add to {countryName}
        </Button>
      )}

      {isOwner && (
        <MovieAddDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          countryCode={countryCode}
          existingCount={countryMovies.length}
          onAdded={(movie) => onMoviesChange((prev) => [...prev, movie])}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="$ rm"
        description="delete this title?"
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
