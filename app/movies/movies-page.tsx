"use client";

import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useRef } from "react";
import { MovieMap } from "@/components/movies/movie-map";
import { CountryPanel } from "@/components/movies/country-panel";
import type { Movie } from "@/components/movies/types";

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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

  const handleCountryClick = (countryCode: string) => {
    if (selectedCountry === countryCode) {
      setSelectedCountry(null);
    } else {
      setSelectedCountry(countryCode);
      setTimeout(() => {
        panelRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 flex-1 w-full max-w-5xl mx-auto">
      <PageHeader title="movies" description="cinematic atlas" />

      <MovieMap
        movies={movies}
        selectedCountry={selectedCountry}
        onCountryClick={handleCountryClick}
      />

      {selectedCountry && (
        <div ref={panelRef}>
          <CountryPanel
            countryCode={selectedCountry}
            movies={movies}
            isOwner={isOwner}
            onClose={() => setSelectedCountry(null)}
            onMoviesChange={setMovies}
          />
        </div>
      )}
    </div>
  );
}
