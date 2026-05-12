import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "rehberiniz",
};

export default function RehberinizPage() {
  return (
    <div className="flex flex-col gap-12 flex-1 w-full max-w-3xl ml-auto mr-auto">
      <PageHeader
        title="rehberiniz"
        description="a multitenant course platform"
      />
    </div>
  );
}
