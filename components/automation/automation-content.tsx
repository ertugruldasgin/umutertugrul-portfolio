"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { JobCard } from "@/components/automation/job-card";
import { JobCreateDialog } from "@/components/automation/job-create-dialog";
import { useAutomation } from "@/hooks/use-automation";
import type { AutomationJob } from "@/components/automation/types";

interface AutomationContentProps {
  initialJobs: AutomationJob[];
  isOwner: boolean;
}

export function AutomationContent({
  initialJobs,
  isOwner,
}: AutomationContentProps) {
  const auto = useAutomation({ initialJobs, isOwner });
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      {/* new button */}
      {isOwner && (
        <div className="flex justify-end -mt-4 md:-mt-8">
          <Button
            size="sm"
            onClick={() => setCreateOpen(!createOpen)}
            className="hover:cursor-pointer rounded-lg hover:bg-primary-hover px-1.5 sm:px-2.5"
          >
            <PlusIcon className="size-4" />
            <span className="hidden sm:block ml-1">New</span>
          </Button>
        </div>
      )}

      <JobCreateDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* active jobs */}
      {auto.activeJobs.length > 0 && (
        <div className="flex flex-col gap-4">
          <span className="text-sm text-warning">active</span>
          {auto.activeJobs.map((job) => (
            <JobCard
              color="warning"
              key={job.id}
              job={job}
              isOwner={isOwner}
              expanded={auto.expandedJob === job.id}
              onToggle={() => auto.toggleExpand(job.id)}
              onCancel={() => auto.requestCancel(job.id)}
              onDelete={() => auto.requestDelete(job.id)}
            />
          ))}
        </div>
      )}

      {/* history */}
      {auto.pastJobs.length > 0 && (
        <div className="flex flex-col gap-6">
          <span className="text-sm text-primary">history</span>
          {auto.pastJobs.map((job) => (
            <JobCard
              color={
                job.status === "completed"
                  ? "primary"
                  : job.status === "failed" || job.status === "cancelled"
                    ? "destructive"
                    : "warning"
              }
              key={job.id}
              job={job}
              isOwner={isOwner}
              expanded={auto.expandedJob === job.id}
              onToggle={() => auto.toggleExpand(job.id)}
              onCancel={() => {}}
              onDelete={() => auto.requestDelete(job.id)}
            />
          ))}
        </div>
      )}

      {/* empty state */}
      {auto.jobs.length === 0 && (
        <p className="text-subtle font-mono text-sm sm:text-base py-8 text-center">
          no jobs yet.
        </p>
      )}

      <ConfirmDialog
        open={auto.cancelOpen}
        title="$ kill"
        description="cancel this running job?"
        onConfirm={auto.handleCancel}
        onCancel={auto.dismissCancel}
      />

      <ConfirmDialog
        open={auto.confirmOpen}
        title="$ rm"
        description="delete this job record?"
        onConfirm={auto.handleDelete}
        onCancel={auto.dismissDelete}
      />
    </>
  );
}
