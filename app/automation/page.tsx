import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { AutomationContent } from "@/components/automation/automation-content";

export const metadata = {
  title: "automation",
};

export default async function AutomationPage() {
  const supabase = await createClient();

  const { data: jobs } = await supabase
    .from("automation_jobs")
    .select("*")
    .order("created_at", { ascending: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = !!user;

  return (
    <div className="flex flex-col gap-6 md:gap-12 flex-1 w-full max-w-3xl mx-auto">
      <PageHeader
        title="automation"
        description="monitoring live processes and past runs"
      />
      <AutomationContent initialJobs={jobs || []} isOwner={isOwner} />
    </div>
  );
}
