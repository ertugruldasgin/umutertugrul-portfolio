import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Reading — Umut Ertugrul",
};

export default function ReadingPage() {
  return (
    <div className="flex flex-col gap-12 flex-1 w-full">
      <PageHeader
        title="reading"
        description="a list of books I'm currently reading or have finished"
      />
    </div>
  );
}
