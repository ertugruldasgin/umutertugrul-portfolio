export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  tags: string[];
  published: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractToc(html: string): TocItem[] {
  if (typeof window === "undefined") return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");
  return Array.from(headings).map((h, i) => ({
    id: `heading-${i}`,
    text: h.textContent || "",
    level: parseInt(h.tagName[1]),
  }));
}

export function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
