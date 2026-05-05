import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Activity — Umut Ertugrul",
};

export default function ActivityPage() {
  return (
    <div className="flex flex-col gap-12 flex-1 w-full">
      <PageHeader
        title="activity"
        description="a trail of things i've touched recently"
      />
    </div>
  );
}
