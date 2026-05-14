import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "movies",
};

export default function MoviesPage() {
  return (
    <div className="flex flex-col gap-12 flex-1 w-full max-w-3xl ml-auto mr-auto">
      <PageHeader title="movies" />
    </div>
  );
}
