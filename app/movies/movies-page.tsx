"use client";

import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { Trash2, GripVertical, Film, Tv, X, CameraIcon } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import Image from "next/image";
import { NUMERIC_TO_ALPHA2, COUNTRY_NAMES } from "@/lib/countries";
import "flag-icons/css/flag-icons.min.css";
import { Input } from "@/components/ui/input";
import { TerminalCard } from "@/components/terminal-card";
import { SectionDivider } from "@/components/section-divider";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface Movie {
  id: string;
  title: string;
  director: string | null;
  year: number | null;
  poster_url: string | null;
  country_code: string;
  type: "movie" | "series";
  rating: number | null;
  rank_in_country: number | null;
  tags: string[];
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

function FlagIcon({ code, className }: { code: string; className?: string }) {
  return <span className={`fi fi-${code.toLowerCase()} ${className || ""}`} />;
}

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [dragItem, setDragItem] = useState<number | null>(null);
  const [savingRank, setSavingRank] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDirector, setNewDirector] = useState("");
  const [newYear, setNewYear] = useState("");
  const [newType, setNewType] = useState<"movie" | "series">("movie");
  const [newPosterFile, setNewPosterFile] = useState<File | null>(null);
  const [newPosterPreview, setNewPosterPreview] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    code: string;
  } | null>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("movies")
        .select("*")
        .order("rank_in_country", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true });

      if (data) setMovies(data as Movie[]);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setIsOwner(true);
    };
    init();
  }, []);

  const countriesWithMovies = new Set(movies.map((m) => m.country_code));

  const countryMovies = selectedCountry
    ? movies
        .filter((m) => m.country_code === selectedCountry)
        .sort((a, b) => {
          if (a.rank_in_country != null && b.rank_in_country != null)
            return a.rank_in_country - b.rank_in_country;
          if (a.rank_in_country != null) return -1;
          if (b.rank_in_country != null) return 1;
          return 0;
        })
    : [];

  const handleCountryClick = (countryCode: string) => {
    if (selectedCountry === countryCode) {
      setSelectedCountry(null);
      setAddOpen(false);
    } else {
      setSelectedCountry(countryCode);
      setAddOpen(false);
      setTimeout(() => {
        panelRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const handlePosterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewPosterFile(file);
    setNewPosterPreview(URL.createObjectURL(file));
  };

  const handleAdd = async () => {
    if (!newTitle.trim() || !selectedCountry) return;
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

    if (newPosterFile) {
      const ext = newPosterFile.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("movie-posters")
        .upload(path, newPosterFile);

      if (!error) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("movie-posters").getPublicUrl(path);
        posterUrl = publicUrl;
      }
    }

    const countryMovieCount = movies.filter(
      (m) => m.country_code === selectedCountry,
    ).length;

    const { data } = await supabase
      .from("movies")
      .insert({
        title: newTitle.trim(),
        director: newDirector.trim() || null,
        year: newYear ? parseInt(newYear) : null,
        type: newType,
        country_code: selectedCountry,
        rank_in_country: countryMovieCount + 1,
        poster_url: posterUrl,
        user_id: user.id,
      })
      .select()
      .single();

    if (data) {
      setMovies((prev) => [...prev, data as Movie]);
      resetAddForm();
    }
    setAdding(false);
  };

  const resetAddForm = () => {
    setAddOpen(false);
    setNewTitle("");
    setNewDirector("");
    setNewYear("");
    setNewType("movie");
    setNewPosterFile(null);
    setNewPosterPreview(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setConfirmOpen(false);
    const supabase = createClient();
    await supabase.from("movies").delete().eq("id", deleteTarget);
    setMovies((prev) => prev.filter((m) => m.id !== deleteTarget));
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
    setMovies((prev) =>
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

    setMovies((prev) => {
      const others = prev.filter((m) => m.country_code !== selectedCountry);
      return [...others, ...updated];
    });
    setDragItem(index);
  };

  const handleDragEnd = async () => {
    setDragItem(null);
    if (!selectedCountry) return;

    setSavingRank(true);
    const supabase = createClient();
    const ranked = movies
      .filter((m) => m.country_code === selectedCountry)
      .sort((a, b) => (a.rank_in_country ?? 0) - (b.rank_in_country ?? 0));

    for (const m of ranked) {
      await supabase
        .from("movies")
        .update({ rank_in_country: m.rank_in_country })
        .eq("id", m.id);
    }
    setSavingRank(false);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 flex-1 w-full max-w-5xl mx-auto">
      <PageHeader title="movies" description="cinematic atlas" />

      {/* map */}
      <div className="w-full max-h-[32rem] border border-primary rounded-lg overflow-hidden">
        <ComposableMap
          projectionConfig={{ scale: 144, center: [20, -32] }}
          className="w-full h-auto"
          style={{ backgroundColor: "transparent" }}
        >
          <ZoomableGroup>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const numericId = geo.id;
                  const alpha2 = NUMERIC_TO_ALPHA2[numericId] || "";
                  const hasMovies = countriesWithMovies.has(alpha2);
                  const isSelected = selectedCountry === alpha2;
                  const count = movies.filter(
                    (m) => m.country_code === alpha2,
                  ).length;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => alpha2 && handleCountryClick(alpha2)}
                      onMouseEnter={(e) => {
                        if (alpha2) {
                          setTooltip({
                            x: e.clientX,
                            y: e.clientY,
                            code: alpha2,
                          });
                        }
                      }}
                      onMouseMove={(e) => {
                        if (alpha2) {
                          setTooltip({
                            x: e.clientX,
                            y: e.clientY,
                            code: alpha2,
                          });
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      className="outline-none hover:cursor-pointer"
                      style={{
                        default: {
                          fill: isSelected
                            ? "var(--color-primary)"
                            : hasMovies
                              ? "var(--color-primary)"
                              : "var(--color-surface)",
                          stroke: "var(--color-border)",
                          strokeWidth: isSelected ? 0.4 : 0.2,
                          cursor: "pointer",
                          opacity: isSelected
                            ? 1
                            : hasMovies
                              ? 0.4 + Math.min(count * 0.12, 0.5)
                              : 0.15,
                        },
                        hover: {
                          fill: hasMovies
                            ? "var(--color-primary-hover)"
                            : "var(--color-primary)",
                          stroke: "var(--color-primary-hover)",
                          strokeWidth: 0.4,
                          opacity: hasMovies ? 1 : 0.25,
                        },
                        pressed: {
                          fill: "var(--color-primary)",
                          opacity: 1,
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      <div className="-mt-4 flex gap-4 text-xs font-mono text-subtle/60">
        <span>{movies.length} titles</span>
        <span>{countriesWithMovies.size} countries</span>
        <span>{movies.filter((m) => m.type === "movie").length} movies</span>
        <span>{movies.filter((m) => m.type === "series").length} series</span>
      </div>

      {/* country panel */}
      {selectedCountry && (
        <div ref={panelRef} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlagIcon code={selectedCountry} className="text-lg rounded-sm" />
              <span className="font-mono text-foreground">
                {COUNTRY_NAMES[selectedCountry] || selectedCountry}
              </span>
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
                onClick={() => {
                  setSelectedCountry(null);
                  setAddOpen(false);
                }}
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
                className={`group flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors ${
                  dragItem === index
                    ? "opacity-50 bg-surface"
                    : "hover:bg-surface"
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
                    className="w-9 h-[54px] object-cover rounded-sm shrink-0"
                  />
                ) : (
                  <div className="w-9 h-[54px] bg-surface rounded-sm shrink-0 flex items-center justify-center">
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

            {countryMovies.length === 0 && !addOpen && (
              <p className="text-subtle/40 font-mono text-sm py-2 text-center">
                no movies yet.
              </p>
            )}
          </div>

          {/* add form */}
          {isOwner && !addOpen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAddOpen(true)}
              className="hover:cursor-pointer rounded-lg hover:bg-primary-hover/10 w-full"
            >
              <PlusIcon className="size-4 mr-1" />
              Add to {COUNTRY_NAMES[selectedCountry] || selectedCountry}
            </Button>
          )}

          {isOwner && addOpen && (
            <div>
              <TerminalCard
                title="new movie"
                className="text-primary border-primary hidden md:block"
              >
                <div className="flex flex-row gap-4 shrink-0">
                  <div className="relative group w-36 md:w-56">
                    {newPosterPreview ? (
                      <Image
                        width={224}
                        height={336}
                        src={newPosterPreview}
                        alt={"preview"}
                        className="w-36 md:w-full aspect-2/3 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-36 md:w-full aspect-2/3 bg-surface rounded-lg flex items-center justify-center">
                        <span className="text-2xl text-subtle/30 font-serif">
                          {newTitle[0]}
                        </span>
                      </div>
                    )}
                    <>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md cursor-pointer"
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
                    </>
                  </div>
                  <div className="flex flex-col w-full gap-3 justify-around">
                    <div className="flex gap-2">
                      {(["movie", "series"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setNewType(t)}
                          className={`px-2 py-1 rounded-md text-xs font-mono cursor-pointer transition-colors ${
                            newType === t
                              ? "bg-primary text-background"
                              : "bg-surface text-subtle hover:text-foreground"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <label htmlFor="new-title" className="flex flex-col gap-1">
                      <span className="text-sm text-foreground tracking-wide">
                        title
                      </span>
                      <Input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="h-8 w-full text-sm font-mono bg-transparent"
                      />
                    </label>

                    <label
                      htmlFor="new-director"
                      className="flex flex-col gap-1"
                    >
                      <span className="text-sm text-foreground tracking-wide">
                        director
                      </span>
                      <Input
                        id="new-director"
                        value={newDirector}
                        onChange={(e) => setNewDirector(e.target.value)}
                        className="h-8 text-sm font-mono bg-transparent"
                      />
                    </label>

                    <label htmlFor="new-year" className="flex flex-col gap-1">
                      <span className="text-sm text-foreground tracking-wide">
                        year
                      </span>
                      <div className="flex flex-row gap-4 justify-between">
                        <Input
                          id="new-year"
                          type="number"
                          value={newYear}
                          onChange={(e) => setNewYear(e.target.value)}
                          className="h-8 w-24 text-sm font-mono bg-transparent"
                        />
                      </div>
                    </label>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetAddForm}
                        className="hover:cursor-pointer rounded-lg hover:bg-primary-hover/10"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAdd}
                        disabled={!newTitle.trim() || adding}
                        className="hover:cursor-pointer rounded-lg bg-primary hover:bg-primary-hover px-2.5"
                      >
                        {adding ? "Adding..." : "Add"}
                      </Button>
                    </div>
                  </div>
                </div>
              </TerminalCard>

              <div className="block md:hidden">
                <SectionDivider
                  title="new movie"
                  titleClassName="text-primary"
                  lineClassName="bg-primary"
                  className="mb-4"
                />
                <div className="flex flex-row gap-4 shrink-0">
                  <div className="flex flex-col gap-2">
                    <div className="relative group w-30">
                      {newPosterPreview ? (
                        <Image
                          width={224}
                          height={336}
                          src={newPosterPreview}
                          alt={"preview"}
                          className="w-30 md:w-full aspect-2/3 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-30 aspect-2/3 bg-surface rounded-lg flex items-center justify-center">
                          <span className="text-2xl text-subtle/30 font-serif">
                            {newTitle[0]}
                          </span>
                        </div>
                      )}
                      <>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md cursor-pointer"
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
                      </>
                    </div>
                    <div className="flex gap-2">
                      {(["movie", "series"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setNewType(t)}
                          className={`px-2 py-1 rounded-md text-xs font-mono cursor-pointer transition-colors ${
                            newType === t
                              ? "bg-primary text-background"
                              : "bg-surface text-subtle hover:text-foreground"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col w-full gap-1.5">
                    <label htmlFor="new-title" className="flex flex-col gap-1">
                      <span className="text-sm text-foreground tracking-wide">
                        title
                      </span>
                      <Input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="h-8 w-full text-sm font-mono bg-transparent"
                      />
                    </label>

                    <label
                      htmlFor="new-director"
                      className="flex flex-col gap-1"
                    >
                      <span className="text-sm text-foreground tracking-wide">
                        director
                      </span>
                      <Input
                        id="new-director"
                        value={newDirector}
                        onChange={(e) => setNewDirector(e.target.value)}
                        className="h-8 text-sm font-mono bg-transparent"
                      />
                    </label>

                    <label htmlFor="new-year" className="flex flex-col gap-1">
                      <span className="text-sm text-foreground tracking-wide">
                        year
                      </span>
                      <div className="flex flex-row justify-between">
                        <Input
                          id="new-year"
                          type="number"
                          value={newYear}
                          onChange={(e) => setNewYear(e.target.value)}
                          className="h-8 w-24 text-sm font-mono bg-transparent"
                        />
                      </div>
                    </label>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetAddForm}
                        className="hover:cursor-pointer rounded-lg hover:bg-primary-hover/10"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAdd}
                        disabled={!newTitle.trim() || adding}
                        className="hover:cursor-pointer rounded-lg bg-primary hover:bg-primary-hover px-2.5"
                      >
                        {adding ? "Adding..." : "Add"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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

      {/* tooltip */}
      {tooltip && (
        <div
          className="fixed z-100 pointer-events-none flex items-center gap-2 px-2 py-1 bg-background rounded-lg shadow-lg"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 20,
          }}
        >
          <span
            className={`fi fi-${tooltip.code.toLowerCase()} rounded-sm`}
            style={{ fontSize: "1rem" }}
          />
          <span className="text-sm text-foreground">
            {COUNTRY_NAMES[tooltip.code] || tooltip.code}
          </span>
          {countriesWithMovies.has(tooltip.code) && (
            <span className="text-sm text-primary-hover">
              {movies.filter((m) => m.country_code === tooltip.code).length}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
