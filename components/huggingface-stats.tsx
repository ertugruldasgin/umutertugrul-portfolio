import { HFStats } from "@/lib/huggingface";
import { formatDistanceToNow } from "date-fns";

interface HuggingFaceStatsProps {
  stats: HFStats;
}

export function HuggingFaceStats({ stats }: HuggingFaceStatsProps) {
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-1">
        {stats.datasets.map((dataset) => (
          <li key={dataset.id} className="text-sm">
            <a
              href={dataset.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-1 px-3 py-2.5 -mx-3 md:-mx-1 rounded-lg hover:bg-surface"
            >
              <span className="text-foreground group-hover:text-warning transition-colors">
                {dataset.name}
              </span>
              <span className="text-xs text-subtle font-mono flex items-center gap-2">
                <span className="text-secondary">
                  {dataset.downloadsAllTime} downloads
                </span>
                {dataset.likes > 0 && (
                  <span className="text-danger">
                    {dataset.likes} like{dataset.likes > 1 ? "s" : ""}
                  </span>
                )}
                <span>
                  {formatDistanceToNow(new Date(dataset.lastModified), {
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
