export const siteMap: Record<string, string[]> = {
  "/": ["projects", "now", "uses", "reading", "activity", "whoami"],
  "/projects": ["rehberiniz"],
  "/now": [],
  "/uses": [],
  "/reading": [],
  "/activity": [],
  "/whoami": [],
};

export function getChildren(currentPath: string): string[] {
  return siteMap[currentPath] ?? [];
}

export function getSiblings(currentPath: string): string[] {
  const segments = currentPath.split("/").filter(Boolean);
  if (segments.length === 0) return siteMap["/"] ?? [];
  const parentPath = "/" + segments.slice(0, -1).join("/");
  return siteMap[parentPath] ?? [];
}

export function getNavOptions(currentPath: string): {
  type: "children" | "siblings";
  items: string[];
} {
  const children = getChildren(currentPath);
  if (children.length > 0) {
    return { type: "children", items: children };
  }
  return { type: "siblings", items: getSiblings(currentPath) };
}

export function buildNavHref(
  currentPath: string,
  item: string,
  type: "children" | "siblings",
): string {
  if (type === "children") {
    return currentPath === "/" ? `/${item}` : `${currentPath}/${item}`;
  }

  const segments = currentPath.split("/").filter(Boolean);
  if (segments.length === 0) return `/${item}`;
  const parentSegments = segments.slice(0, -1);
  return "/" + [...parentSegments, item].join("/");
}
