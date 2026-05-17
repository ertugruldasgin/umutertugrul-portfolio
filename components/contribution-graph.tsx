"use client";

import { ContributionData } from "@/lib/github";
import { SubHeader } from "./sub-header";
import { useState } from "react";

interface ContributionGraphProps {
  data: ContributionData;
}

const CELL_SIZE = 11;
const CELL_GAP = 3;

export function ContributionGraph({ data }: ContributionGraphProps) {
  const weeksCount = data.weeks.length;
  const width = weeksCount * (CELL_SIZE + CELL_GAP);
  const height = 7 * (CELL_SIZE + CELL_GAP);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    count: number;
    date: string;
  } | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <SubHeader title="Contributions" />
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-subtle">
          {data.totalContributions.toLocaleString()} contributions in the last
          year
        </span>
      </div>

      <div className="overflow-x-auto scrollbar-hide relative">
        <svg
          width={width}
          height={height}
          className="block"
          role="img"
          aria-label={`GitHub contribution graph: ${data.totalContributions} contributions in the last year`}
          onMouseLeave={() => setTooltip(null)}
        >
          {data.weeks.map((week, weekIndex) =>
            week.days.map((day, dayIndex) => (
              <rect
                key={`${weekIndex}-${dayIndex}`}
                x={weekIndex * (CELL_SIZE + CELL_GAP)}
                y={dayIndex * (CELL_SIZE + CELL_GAP)}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={2}
                className={cellFillClass(day.level)}
                aria-label={`${day.count} contributions on ${day.date}`}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                    count: day.count,
                    date: day.date,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            )),
          )}
        </svg>

        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none px-2 py-1 rounded-lg border border-border/70 bg-surface/20 backdrop-blur-sm text-xs font-mono shadow-lg select-none"
            style={{
              left: tooltip.x,
              top: tooltip.y - 8,
              transform: "translate(-50%, -100%)",
            }}
          >
            <span className="text-primary">{tooltip.count}</span>{" "}
            {tooltip.count === 1 ? "contribution" : "contributions"}{" "}
            <span className="text-subtle">{formatDate(tooltip.date)}</span>
          </div>
        )}
      </div>
      <Legend />
    </div>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Legend() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-subtle">
      <span>less</span>
      {[0, 1, 2, 3, 4].map((level) => (
        <span
          key={level}
          className={`inline-block w-2.5 h-2.5 rounded-xs ${legendBgClass(
            level as 0 | 1 | 2 | 3 | 4,
          )}`}
        />
      ))}
      <span>more</span>
    </div>
  );
}

function cellFillClass(level: 0 | 1 | 2 | 3 | 4): string {
  switch (level) {
    case 0:
      return "fill-surface";
    case 1:
      return "fill-primary-hover/25";
    case 2:
      return "fill-primary-hover/50";
    case 3:
      return "fill-primary-hover/75";
    case 4:
      return "fill-primary-hover";
  }
}

function legendBgClass(level: 0 | 1 | 2 | 3 | 4): string {
  switch (level) {
    case 0:
      return "bg-surface";
    case 1:
      return "bg-primary-hover/25";
    case 2:
      return "bg-primary-hover/50";
    case 3:
      return "bg-primary-hover/75";
    case 4:
      return "bg-primary-hover";
  }
}
