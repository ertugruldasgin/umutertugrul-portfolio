import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Now — Umut Ertugrul",
};

export default function NowPage() {
  return (
    <div className="flex flex-col gap-12 flex-1 w-full">
      <PageHeader
        title="now"
        description="what I'm doing at the moment — inspired by nownownow.com"
      />
    </div>
  );
}
