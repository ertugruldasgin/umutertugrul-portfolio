"use client";

import { useEffect, useState } from "react";
import { AutomationJob } from "./types";

interface JobProgressProps {
  job: AutomationJob;
  compact?: boolean;
}

export function JobProgress({ job, compact = false }: JobProgressProps) {
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (job.status !== "running") return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [job.status]);

  const progress =
    job.progress_total && job.progress_total > 0
      ? Math.round((job.progress_current / job.progress_total) * 100)
      : null;

  if (progress === null) return null;

  const eta = (() => {
    if (
      job.status !== "running" ||
      !job.started_at ||
      !job.progress_total ||
      job.progress_current <= 0 ||
      now === 0
    )
      return null;

    const elapsed = now - new Date(job.started_at).getTime();
    const rate = job.progress_current / elapsed;
    const remaining = job.progress_total - job.progress_current;
    const msLeft = remaining / rate;

    if (msLeft < 60000) return `~${Math.ceil(msLeft / 1000)}s left`;
    if (msLeft < 3600000) return `~${Math.ceil(msLeft / 60000)}m left`;
    return `~${(msLeft / 3600000).toFixed(1)}h left`;
  })();

  const isActive = job.status === "queued" || job.status === "running";

  if (!isActive) {
    return (
      <span className="text-xs font-mono text-subtle/40 shrink-0">
        {job.progress_current.toLocaleString()}/
        {job.progress_total?.toLocaleString()}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
      <div
        className={`${compact ? "w-16" : "w-20"} h-2 bg-surface rounded-full overflow-hidden`}
      >
        <div
          className="h-full bg-warning rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
        <span className="text-xs font-mono text-subtle/60 w-8 text-right">
          {progress}%
        </span>
      </div>

      {eta && (
        <span className="text-xs font-mono text-subtle/40 hidden sm:inline">
          {eta}
        </span>
      )}
    </div>
  );
}

export function JobProgressBar({ job }: { job: AutomationJob }) {
  const progress =
    job.progress_total && job.progress_total > 0
      ? Math.round((job.progress_current / job.progress_total) * 100)
      : null;

  if (job.status !== "running" || progress === null) return null;

  return (
    <div className="w-full mt-2 h-4 bg-surface overflow-hidden">
      <div
        className="h-full bg-warning transition-all duration-500 animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.8)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
