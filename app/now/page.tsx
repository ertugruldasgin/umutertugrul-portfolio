import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600;

export const metadata = {
  title: "now",
};

export default async function NowPage() {
  const supabase = await createClient();

  const { data: latestUpdate, error } = await supabase
    .from("now_updates")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(1)
    .single();

  return (
    <div className="flex flex-col gap-12 flex-1 w-full max-w-3xl ml-auto mr-auto">
      <div className="flex flex-col gap-6">
        <PageHeader title="now" description="what i'm doing at the moment." />

        {error || !latestUpdate ? (
          <div>
            <p>No updates yet.</p>
          </div>
        ) : (
          latestUpdate.content
        )}
      </div>
    </div>
  );
}
