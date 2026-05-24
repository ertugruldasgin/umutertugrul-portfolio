"use client";

import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { NUMERIC_TO_ALPHA2, COUNTRY_NAMES } from "@/lib/countries";
import "flag-icons/css/flag-icons.min.css";
import type { Movie } from "./types";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface MovieMapProps {
  movies: Movie[];
  selectedCountry: string | null;
  onCountryClick: (countryCode: string) => void;
}

export function MovieMap({
  movies,
  selectedCountry,
  onCountryClick,
}: MovieMapProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    code: string;
  } | null>(null);

  const countriesWithMovies = new Set(movies.map((m) => m.country_code));

  return (
    <>
      <div className="w-full max-h-128 border border-primary rounded-lg overflow-hidden">
        <ComposableMap
          projectionConfig={{ scale: 300, center: [0, 16] }}
          className="w-full h-auto"
          style={{ backgroundColor: "var(--color-background)" }}
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
                      onClick={() => alpha2 && onCountryClick(alpha2)}
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
                          fill: "var(--color-primary)",
                          stroke: "var(--color-surface)",
                          strokeWidth: isSelected ? 1.0 : 0.8,
                          cursor: "pointer",
                          opacity: isSelected
                            ? 1
                            : hasMovies
                              ? 0.4 + Math.min(count * 0.12, 0.5)
                              : 0.1,
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

      {/* stats */}
      <div className="-mt-4 flex gap-4 text-xs font-mono text-subtle/60">
        <span>{movies.length} titles</span>
        <span>{countriesWithMovies.size} countries</span>
        <span>{movies.filter((m) => m.type === "movie").length} movies</span>
        <span>{movies.filter((m) => m.type === "series").length} series</span>
      </div>

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
    </>
  );
}
