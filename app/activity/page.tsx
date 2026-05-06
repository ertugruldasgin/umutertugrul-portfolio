import { ContributionGraph } from "@/components/contribution-graph";
import { PageHeader } from "@/components/page-header";
import { RecentCommits } from "@/components/recent-commits";
import { SubHeader } from "@/components/sub-header";
import { TerminalCard } from "@/components/terminal-card";
import {
  fetchContributions,
  fetchRecentCommits,
  RecentCommit,
} from "@/lib/github";

export default async function ActivityPage() {
  let contributions = null;
  let commits: RecentCommit[] = [];

  try {
    [contributions, commits] = await Promise.all([
      fetchContributions(),
      fetchRecentCommits(15),
    ]);
  } catch (error) {
    console.error("GitHub fetch failed:", error);
  }

  return (
    <div className="flex flex-col gap-12 flex-1 w-full">
      <PageHeader
        title="activity"
        description="a trail of things i've touched recently"
      />

      {contributions ? (
        <ContributionGraph data={contributions} />
      ) : (
        <p className="text-sm text-subtle italic">
          Couldn&apos;t load contribution graph.
        </p>
      )}

      <div className="block md:hidden">
        <SubHeader title="Recent Commits" />
        <RecentCommits commits={commits} />
      </div>

      <TerminalCard
        title="recent commits"
        className="border-primary-hover text-primary-hover hidden md:block"
      >
        <RecentCommits commits={commits} />
      </TerminalCard>
    </div>
  );
}
