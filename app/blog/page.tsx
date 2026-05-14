import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "blog",
};

export default function BlogPage() {
  return (
    <div className="flex flex-col gap-12 flex-1 w-full max-w-3xl ml-auto mr-auto">
      <PageHeader title="blog" />
    </div>
  );
}
