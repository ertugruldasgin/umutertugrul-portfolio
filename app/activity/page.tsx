import { ContributionGraph } from "@/components/contribution-graph";
import { HuggingFaceStats } from "@/components/huggingface-stats";
import { PageHeader } from "@/components/page-header";
import { RecentCommits } from "@/components/recent-commits";
import { SubHeader } from "@/components/sub-header";
import { TerminalCard } from "@/components/terminal-card";
import {
  fetchContributions,
  fetchRecentCommits,
  RecentCommit,
} from "@/lib/github";
import { HFStats, fetchHFDatasets } from "@/lib/huggingface";

export default async function ActivityPage() {
  let contributions = null;
  let commits: RecentCommit[] = [];
  let hfStats: HFStats | null = null;

  try {
    [contributions, commits, hfStats] = await Promise.all([
      fetchContributions(),
      fetchRecentCommits(15),
      fetchHFDatasets(),
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
        <SubHeader title="recent commits" />
        <RecentCommits commits={commits} />
      </div>

      <TerminalCard
        title="recent commits"
        className="border-primary-hover text-primary-hover hidden md:block"
      >
        <RecentCommits commits={commits} />
      </TerminalCard>

      {hfStats && hfStats.datasets.length > 0 && (
        <div>
          <div className="block md:hidden">
            <SubHeader title="datasets" />
            <HuggingFaceStats stats={hfStats} />
          </div>
          <TerminalCard
            title="datasets"
            className="border-warning text-warning hidden md:block"
          >
            <HuggingFaceStats stats={hfStats} />
          </TerminalCard>
        </div>
      )}
    </div>
  );
}
