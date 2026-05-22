"use client";

import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AutomationJob } from "@/components/automation/types";
import { JobCard } from "@/components/automation/job-card";
import { JobCreateDialog } from "@/components/automation/job-create-dialog";

export default function AutomationPage() {
  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const init = async () => {
      const { data } = await supabase
        .from("automation_jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setJobs(data as AutomationJob[]);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setIsOwner(true);
    };

    init();

    const channel = supabase
      .channel("automation-jobs")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "portfolio",
          table: "automation_jobs",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setJobs((prev) => [payload.new as AutomationJob, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setJobs((prev) =>
              prev.map((j) =>
                j.id === payload.new.id ? (payload.new as AutomationJob) : j,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setJobs((prev) => prev.filter((j) => j.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelOpen(false);
    const supabase = createClient();
    await supabase
      .from("automation_jobs")
      .update({ status: "cancelled", completed_at: new Date().toISOString() })
      .eq("id", cancelTarget);
    setCancelTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setConfirmOpen(false);
    const supabase = createClient();
    await supabase.from("automation_jobs").delete().eq("id", deleteTarget);
    setDeleteTarget(null);
  };

  const activeJobs = jobs.filter(
    (j) => j.status === "queued" || j.status === "running",
  );
  const pastJobs = jobs.filter(
    (j) =>
      j.status === "completed" ||
      j.status === "failed" ||
      j.status === "cancelled",
  );

  return (
    <div className="flex flex-col gap-6 md:gap-12 flex-1 w-full max-w-3xl mx-auto">
      <div className="flex items-start justify-between">
        <PageHeader
          title="automation"
          description="monitoring live processes and past runs"
        />
        {isOwner && (
          <Button
            size="sm"
            onClick={() => setCreateOpen(!createOpen)}
            className="hover:cursor-pointer rounded-lg hover:bg-primary-hover px-1.5 sm:px-2.5"
          >
            <PlusIcon className="size-4" />
            <span className="hidden sm:block ml-1">New</span>
          </Button>
        )}
      </div>

      <JobCreateDialog open={createOpen} onOpenChange={setCreateOpen} />

      {activeJobs.length > 0 && (
        <div className="flex flex-col gap-4">
          <span className="text-sm text-warning">active</span>
          {activeJobs.map((job) => (
            <JobCard
              color="warning"
              key={job.id}
              job={job}
              isOwner={isOwner}
              expanded={expandedJob === job.id}
              onToggle={() =>
                setExpandedJob(expandedJob === job.id ? null : job.id)
              }
              onCancel={() => {
                setCancelTarget(job.id);
                setCancelOpen(true);
              }}
              onDelete={() => {
                setDeleteTarget(job.id);
                setConfirmOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {pastJobs.length > 0 && (
        <div className="flex flex-col gap-6">
          <span className="text-sm text-primary">history</span>
          {pastJobs.map((job) => (
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
              expanded={expandedJob === job.id}
              onToggle={() =>
                setExpandedJob(expandedJob === job.id ? null : job.id)
              }
              onCancel={() => {}}
              onDelete={() => {
                setDeleteTarget(job.id);
                setConfirmOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {jobs.length === 0 && (
        <p className="text-subtle font-mono text-sm sm:text-base py-8 text-center">
          no jobs yet.
        </p>
      )}

      <ConfirmDialog
        open={cancelOpen}
        title="$ kill"
        description="cancel this running job?"
        onConfirm={handleCancel}
        onCancel={() => {
          setCancelOpen(false);
          setCancelTarget(null);
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="$ rm"
        description="delete this job record?"
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
