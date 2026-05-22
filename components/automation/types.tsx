import { Loader2, CheckCircle2, XCircle, Clock, Ban } from "lucide-react";

export interface AutomationJob {
  id: string;
  name: string;
  type: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  progress_current: number;
  progress_total: number | null;
  config: Record<string, any>;
  logs: Record<string, any>[];
  error: string | null;
  user_id: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
}

export interface JobTemplate {
  name: string;
  type: string;
  defaultConfig: Record<string, any>;
}

export const JOB_TEMPLATES: JobTemplate[] = [
  {
    name: "YÖK Thesis Metadata",
    type: "yok-metadata",
    defaultConfig: { start_id: 1, end_id: 700000, batch_size: 100 },
  },
  {
    name: "YÖK Thesis PDF Extract",
    type: "yok-pdf-extract",
    defaultConfig: { concurrency: 5, ocr_model: "gemma-4-e4b" },
  },
  {
    name: "Medical Articles",
    type: "medical-articles",
    defaultConfig: { sources: [], max_pages: 1000 },
  },
  {
    name: "Test Counter",
    type: "test",
    defaultConfig: { total: 100, delay: 0.1 },
  },
];

export const STATUS_ICONS: Record<AutomationJob["status"], React.ReactNode> = {
  queued: <Clock className="size-4 text-warning" />,
  running: <Loader2 className="size-4 text-warning   animate-spin" />,
  completed: <CheckCircle2 className="size-4 text-primary" />,
  failed: <XCircle className="size-4 text-destructive" />,
  cancelled: <Ban className="size-4 text-destructive" />,
};

export const COLOR_CLASSES: Record<string, { text: string; border: string }> = {
  primary: { text: "text-primary", border: "border-primary" },
  warning: { text: "text-warning", border: "border-warning" },
  destructive: { text: "text-destructive", border: "border-destructive" },
};
