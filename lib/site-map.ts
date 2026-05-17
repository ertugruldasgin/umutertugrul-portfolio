interface SiteMapEntry {
  children: string[];
  adminOnly?: boolean;
}

export const siteMap: Record<string, SiteMapEntry> = {
  "/": {
    children: [
      "now",
      "calendar",
      "automation",
      "notes",
      "diagrams",
      "activity",
      "blog",
      "reading",
      "movies",
      "uses",
      "whoami",
    ],
  },
  "/now": { children: [] },
  "/calendar": { children: [] },
  "/automation": { children: [], adminOnly: true },
  "/notes": { children: [], adminOnly: true },
  "/diagrams": { children: [], adminOnly: true },
  "/activity": { children: [] },
  "/blog": { children: [] },
  "/reading": { children: [] },
  "/movies": { children: [] },
  "/uses": { children: [] },
  "/whoami": { children: [] },
};

const ADMIN_ROUTES = new Set(
  Object.entries(siteMap)
    .filter(([, entry]) => entry.adminOnly)
    .map(([path]) => path.replace("/", "")),
);

export function getChildren(currentPath: string): string[] {
  return siteMap[currentPath]?.children ?? [];
}

export function getSiblings(currentPath: string): string[] {
  const segments = currentPath.split("/").filter(Boolean);
  if (segments.length === 0) return siteMap["/"]?.children ?? [];
  const parentPath = "/" + segments.slice(0, -1).join("/");
  const siblings = siteMap[parentPath]?.children ?? [];
  return ["..", ...siblings];
}

export function filterByRole(items: string[], isAdmin: boolean): string[] {
  if (isAdmin) return items;
  return items.filter((item) => item === ".." || !ADMIN_ROUTES.has(item));
}

export function getNavOptions(
  currentPath: string,
  isAdmin: boolean = false,
): {
  type: "children" | "siblings";
  items: string[];
} {
  const children = getChildren(currentPath);
  if (children.length > 0) {
    const withParent = currentPath === "/" ? children : ["..", ...children];
    return { type: "children", items: filterByRole(withParent, isAdmin) };
  }
  return {
    type: "siblings",
    items: filterByRole(getSiblings(currentPath), isAdmin),
  };
}

export function buildNavHref(
  currentPath: string,
  item: string,
  type: "children" | "siblings",
): string {
  if (item === "..") {
    const segments = currentPath.split("/").filter(Boolean);
    if (segments.length <= 1) return "/";
    return "/" + segments.slice(0, -1).join("/");
  }

  if (type === "children") {
    return currentPath === "/" ? `/${item}` : `${currentPath}/${item}`;
  }
  const segments = currentPath.split("/").filter(Boolean);
  if (segments.length === 0) return `/${item}`;
  const parentSegments = segments.slice(0, -1);
  return "/" + [...parentSegments, item].join("/");
}
