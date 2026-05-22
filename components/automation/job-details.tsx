import { cn } from "@/lib/utils";
import { AutomationJob } from "./types";
import { JobProgressBar } from "./job-progress";

interface JobDetailsProps {
  job: AutomationJob;
  isOwner: boolean;
}

export function JobDetails({ job, isOwner }: JobDetailsProps) {
  return (
    <div className="mt-2 flex flex-col gap-2">
      <JobProgressBar job={job} />

      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <MetaField
          label="status"
          value={job.status}
          textColor={
            job.status == "completed"
              ? "text-primary"
              : job.status == "queued" || job.status == "running"
                ? "text-warning"
                : job.status == "failed" || job.status == "cancelled"
                  ? "text-destructive"
                  : "text-foreground"
          }
        />

        {job.progress_total && (
          <MetaField
            label="progress"
            value={`${job.progress_current.toLocaleString()} / ${job.progress_total.toLocaleString()}`}
          />
        )}

        {job.started_at && (
          <MetaField
            label="started"
            value={new Date(job.started_at).toLocaleString("tr-TR")}
          />
        )}

        {job.completed_at && (
          <MetaField
            label="completed"
            value={new Date(job.completed_at).toLocaleString("tr-TR")}
          />
        )}
      </div>

      {/* error (owner only) */}
      {isOwner && job.error && (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-destructive font-mono">error</span>
          <pre className="max-h-64 sm:max-h-96 text-xs font-mono text-destructive/80 bg-surface rounded-md p-2 overflow-x-auto whitespace-pre-wrap">
            {job.error}
          </pre>
        </div>
      )}

      {/* config (owner only) */}
      {isOwner && Object.keys(job.config).length > 0 && (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-subtle/40 font-mono">config</span>
          <pre className="max-h-64 sm:max-h-96 text-xs font-mono text-subtle/60 bg-surface rounded-md p-2 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(job.config, null, 2)}
          </pre>
        </div>
      )}

      {/* logs (owner only) */}
      {isOwner && job.logs.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-subtle/40 font-mono">
            logs ({job.logs.length})
          </span>
          <div className="max-h-64 sm:max-h-96 overflow-y-auto scrollbar-hide bg-surface rounded-md p-2">
            {job.logs.map((log, i) => (
              <div key={i} className="text-xs font-mono text-subtle/60 py-0.5">
                {typeof log === "string" ? log : JSON.stringify(log)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetaField({
  label,
  value,
  textColor,
}: {
  label: string;
  value: string;
  textColor?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-subtle/40">{label}</span>
      <span className={cn("text-foreground", textColor)}>{value}</span>
    </div>
  );
}
