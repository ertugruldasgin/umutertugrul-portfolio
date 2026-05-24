import { createClient } from "@/lib/supabase/server";
import NowContent from "../../components/now/now-content";
import { NowHeader } from "@/components/now/now-header";
import { Suggest } from "@/components/now/suggest";

export const metadata = {
  title: "now",
};

export default async function Now() {
  const supabase = await createClient();

  const { data: latestUpdate } = await supabase
    .from("now_updates")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = !!user && (!latestUpdate || user.id === latestUpdate.user_id);

  return (
    <div className="flex flex-col gap-6 md:gap-12 flex-1 w-full max-w-3xl mx-auto">
      <NowHeader />

      <div className="flex flex-col flex-1 gap-8">
        <NowContent initialUpdate={latestUpdate || null} isOwner={isOwner} />
      </div>

      <Suggest />
    </div>
  );
}
