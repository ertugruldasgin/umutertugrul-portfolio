import { AgeCounter } from "@/components/age-counter";
import AsciiLogo from "@/components/ascii-logo";
import { ContributionGraph } from "@/components/contribution-graph";
import { HuggingFaceStats } from "@/components/huggingface-stats";
import { RecentCommits } from "@/components/recent-commits";
import { SectionDivider } from "@/components/section-divider";
import { TerminalCard } from "@/components/terminal-card";
import {
  fetchContributions,
  fetchRecentCommits,
  RecentCommit,
} from "@/lib/github";
import { fetchHFDatasets, HFStats } from "@/lib/huggingface";

const birthDate = new Date("2004-11-11T00:00:00");

export default async function Home() {
  let contributions = null;
  let commits: RecentCommit[] = [];
  let hfStats: HFStats | null = null;

  try {
    [contributions, commits, hfStats] = await Promise.all([
      fetchContributions(),
      fetchRecentCommits(5),
      fetchHFDatasets(),
    ]);
  } catch (error) {
    console.error("GitHub fetch failed:", error);
  }

  return (
    <div className="flex flex-col flex-1 w-full max-w-3xl ml-auto mr-auto gap-12">
      <div className="flex flex-col gap-1">
        <pre className="hidden md:block">
          <AsciiLogo />
        </pre>
        <h1 className="block md:hidden text-6xl font-serif text-primary select-none">
          umut ertugrul
        </h1>
        <p className="text-xs md:text-sm text-subtle">
          ~/.config/turkey/computer-engineering-sophomore
        </p>
      </div>

      <TerminalCard title="whoami" className="border-primary text-primary">
        <p className="text-foreground">
          <AgeCounter birthDate={birthDate} /> years old. Homelab tinkerer. I
          build things I wish existed, usually the ones that fit how I live.
        </p>
      </TerminalCard>

      {contributions && <ContributionGraph data={contributions} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col flex-1 gap-2">
          <SectionDivider title="recent commits" />
          <RecentCommits commits={commits} limit={3} />
        </div>
        <div className="flex flex-col flex-1 gap-2">
          <SectionDivider
            title="datasets"
            titleClassName="text-warning"
            lineClassName="bg-warning"
          />
          {hfStats && hfStats.datasets.length > 0 && (
            <HuggingFaceStats stats={hfStats} />
          )}
        </div>
      </div>
    </div>
  );
}
