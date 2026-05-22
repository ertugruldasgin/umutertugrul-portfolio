"use client";

import { Trash2 } from "lucide-react";
import { StopIcon } from "@radix-ui/react-icons";
import { formatDistanceToNow } from "date-fns";
import { AutomationJob, COLOR_CLASSES, STATUS_ICONS } from "./types";
import { JobProgress } from "./job-progress";
import { JobDetails } from "./job-details";
import { TerminalCard } from "../terminal-card";

interface JobCardProps {
  color: string;
  job: AutomationJob;
  isOwner: boolean;
  expanded: boolean;
  onToggle: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

export function JobCard({
  color,
  job,
  isOwner,
  expanded,
  onToggle,
  onCancel,
  onDelete,
}: JobCardProps) {
  const isActive = job.status === "queued" || job.status === "running";
  const colors = COLOR_CLASSES[color] || COLOR_CLASSES.primary;

  return (
    <TerminalCard
      title={job.name}
      className={`${colors.text} ${colors.border} flex flex-col`}
    >
      <button
        onClick={onToggle}
        className="flex items-center w-full gap-3 cursor-pointer"
      >
        {STATUS_ICONS[job.status]}

        <div className="flex flex-col gap-0.5 flex-1 min-w-0 text-left">
          <span className="font-mono text-sm text-foreground truncate">
            {job.name}
          </span>
          <span className="text-xs text-subtle/40 font-mono">
            {job.type}
            {job.created_at &&
              ` - ${formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}`}
          </span>
        </div>

        <div
          className="transition-opacity duration-200"
          style={{
            opacity: expanded ? 0 : 1,
            pointerEvents: expanded ? "none" : "auto",
          }}
        >
          <JobProgress job={job} />
        </div>

        {isOwner && (
          <div className="flex gap-1 shrink-0">
            {isActive && (
              <StopIcon
                className="size-4 text-subtle/40 hover:text-destructive transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
              />
            )}
            {!isActive && (
              <Trash2
                className="size-4 text-subtle/40 hover:text-destructive transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              />
            )}
          </div>
        )}
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <JobDetails job={job} isOwner={isOwner} />
        </div>
      </div>
    </TerminalCard>
  );
}
