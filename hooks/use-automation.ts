import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AutomationJob } from "@/components/automation/types";

interface UseAutomationOptions {
  initialJobs: AutomationJob[];
  isOwner: boolean;
}

export function useAutomation({ initialJobs, isOwner }: UseAutomationOptions) {
  const [jobs, setJobs] = useState<AutomationJob[]>(initialJobs);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

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

  const handleCancel = useCallback(async () => {
    if (!cancelTarget) return;
    setCancelOpen(false);
    const supabase = createClient();
    await supabase
      .from("automation_jobs")
      .update({ status: "cancelled", completed_at: new Date().toISOString() })
      .eq("id", cancelTarget);
    setCancelTarget(null);
  }, [cancelTarget]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setConfirmOpen(false);
    const supabase = createClient();
    await supabase.from("automation_jobs").delete().eq("id", deleteTarget);
    setDeleteTarget(null);
  }, [deleteTarget]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedJob((prev) => (prev === id ? null : id));
  }, []);

  const requestCancel = useCallback((id: string) => {
    setCancelTarget(id);
    setCancelOpen(true);
  }, []);

  const requestDelete = useCallback((id: string) => {
    setDeleteTarget(id);
    setConfirmOpen(true);
  }, []);

  const dismissCancel = useCallback(() => {
    setCancelOpen(false);
    setCancelTarget(null);
  }, []);

  const dismissDelete = useCallback(() => {
    setConfirmOpen(false);
    setDeleteTarget(null);
  }, []);

  const activeJobs = jobs.filter(
    (j) => j.status === "queued" || j.status === "running",
  );
  const pastJobs = jobs.filter(
    (j) =>
      j.status === "completed" ||
      j.status === "failed" ||
      j.status === "cancelled",
  );

  return {
    jobs,
    activeJobs,
    pastJobs,
    isOwner,
    expandedJob,
    confirmOpen,
    cancelOpen,

    toggleExpand,
    requestCancel,
    requestDelete,
    handleCancel,
    handleDelete,
    dismissCancel,
    dismissDelete,
  };
}
