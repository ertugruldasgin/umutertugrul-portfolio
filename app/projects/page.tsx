import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "projects",
};

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-12 flex-1 w-full max-w-3xl ml-auto mr-auto">
      <PageHeader
        title="projects"
        description="a selection of my work, experiments, and collaborations"
      />
    </div>
  );
}
