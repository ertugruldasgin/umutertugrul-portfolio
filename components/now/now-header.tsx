import { PageHeader } from "@/components/page-header";
import Link from "next/link";

export function NowHeader() {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
      <PageHeader
        title="now"
        description={
          <span className="flex flex-col">
            <span>where my focus is right now.</span>
            <span>
              this site is inspired by Derek Sivers&apos;{" "}
              <Link
                href="https://nownownow.com/about"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-hover transition-colors"
              >
                /now
              </Link>{" "}
              project.
            </span>
          </span>
        }
      />
    </div>
  );
}
