import { Octokit } from "octokit";

const TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = process.env.GITHUB_USERNAME;

if (!TOKEN || !USERNAME) {
  throw new Error("GITHUB_TOKEN and GITHUB_USERNAME must be set");
}

const octokit = new Octokit({ auth: TOKEN });

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionWeek {
  days: ContributionDay[];
}

export interface ContributionData {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface RecentCommit {
  repo: string;
  message: string;
  sha: string;
  url: string;
  date: string;
}

export async function fetchContributions(): Promise<ContributionData> {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  const data: any = await octokit.graphql(query, { username: USERNAME });
  const calendar = data.user.contributionsCollection.contributionCalendar;

  const levelMap: Record<string, 0 | 1 | 2 | 3 | 4> = {
    NONE: 0,
    FIRST_QUARTILE: 1,
    SECOND_QUARTILE: 2,
    THIRD_QUARTILE: 3,
    FOURTH_QUARTILE: 4,
  };

  return {
    totalContributions: calendar.totalContributions,
    weeks: calendar.weeks.map((week: any) => ({
      days: week.contributionDays.map((day: any) => ({
        date: day.date,
        count: day.contributionCount,
        level: levelMap[day.contributionLevel] ?? 0,
      })),
    })),
  };
}

export async function fetchRecentCommits(
  limit: number = 10,
): Promise<RecentCommit[]> {
  const REPO_SCAN_COUNT = 8;
  const COMMITS_PER_REPO = 10;

  const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "pushed",
    direction: "desc",
    per_page: REPO_SCAN_COUNT,
    visibility: "all",
    affiliation: "owner",
  });

  const commitsPerRepo = await Promise.all(
    repos.map(async (repo) => {
      try {
        const { data } = await octokit.rest.repos.listCommits({
          owner: repo.owner.login,
          repo: repo.name,
          author: USERNAME,
          per_page: COMMITS_PER_REPO,
        });

        return data.map((commit) => ({
          repo: `${repo.owner.login}/${repo.name}`,
          message: commit.commit.message.split("\n")[0],
          sha: commit.sha,
          url: commit.html_url,
          date:
            commit.commit.author?.date ?? commit.commit.committer?.date ?? "",
        }));
      } catch (error) {
        console.warn(
          `[github] skipped ${repo.full_name}:`,
          (error as Error).message,
        );
        return [];
      }
    }),
  );

  const allCommits = commitsPerRepo
    .flat()
    .filter((c) => c.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

  return allCommits;
}
