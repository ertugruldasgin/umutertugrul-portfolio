import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "reading",
};

export default function ReadingPage() {
  return (
    <div className="flex flex-col gap-12 flex-1 w-full max-w-3xl ml-auto mr-auto">
      <PageHeader
        title="reading"
        description={
          <p>a list of books i&apos;m currently reading or have finished</p>
        }
      />
    </div>
  );
}
