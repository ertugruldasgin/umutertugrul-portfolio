import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "automation",
};

export default function AutomationPage() {
  return (
    <div className="flex flex-col gap-12 flex-1 w-full max-w-3xl ml-auto mr-auto">
      <PageHeader title="automation" />
    </div>
  );
}
