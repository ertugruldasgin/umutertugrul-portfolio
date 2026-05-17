import { RecentCommit } from "@/lib/github";
import { formatDistanceToNow } from "date-fns";

interface RecentCommitsProps {
  commits: RecentCommit[];
  limit?: number;
  showHeader?: boolean;
}

export function RecentCommits({ commits, limit }: RecentCommitsProps) {
  if (commits.length === 0) {
    return <p className="text-sm text-subtle italic">No recent commits.</p>;
  }

  const displayed = limit ? commits.slice(0, limit) : commits;

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-1">
        {displayed.map((commit) => (
          <li key={commit.sha} className="text-sm">
            <a
              href={commit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-1 px-3 py-2.5 -mx-3 md:-mx-1 rounded-lg hover:bg-surface"
            >
              <span className="text-foreground group-hover:text-primary-hover transition-colors">
                {commit.message}
              </span>
              <span className="text-xs text-subtle font-mono flex items-center gap-2">
                <span className="text-secondary">
                  {commit.repo.split("/")[0] + "/" + commit.repo.split("/")[1]}
                </span>
                <span>
                  {formatDistanceToNow(new Date(commit.date), {
                    addSuffix: true,
                  })}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
