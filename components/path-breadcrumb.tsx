"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getNavOptions, buildNavHref } from "@/lib/site-map";

export function PathBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav
      aria-label="Breadcrumb"
      className="absolute text-sm sm:text-base select-none"
    >
      <span className="text-base md:text-lg text-subtle">
        {segments.length === 0 ? (
          <ActiveSegment label="~" currentPath={pathname} />
        ) : (
          <Link
            href="/"
            className="hover:text-primary transition-colors inline-block px-3 py-2 -mx-3 -my-2"
          >
            ~
          </Link>
        )}

        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          const isLast = index === segments.length - 1;

          return (
            <Fragment key={href}>
              <span aria-hidden="true">/</span>
              {isLast ? (
                <ActiveSegment label={segment} currentPath={pathname} />
              ) : (
                <Link
                  href={href}
                  className="hover:text-primary transition-colors"
                >
                  {segment}
                </Link>
              )}
            </Fragment>
          );
        })}
      </span>
    </nav>
  );
}

interface ActiveSegmentProps {
  label: string;
  currentPath: string;
}

function ActiveSegment({ label, currentPath }: ActiveSegmentProps) {
  const { type, items } = getNavOptions(currentPath);

  if (items.length === 0) {
    return (
      <span className="text-foreground" aria-current="page">
        {label}
      </span>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="text-foreground hover:text-primary transition-colors cursor-pointer px-3 py-2 -mx-3 -my-2"
          aria-current="page"
        >
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-48 p-0 border-border rounded-xl bg-surface"
      >
        <div className="px-3 py-2 text-xs text-subtle border-b border-border">
          {parentDisplay(currentPath, type)}
        </div>
        <ScrollArea className="max-h-64">
          <ul className="p-1">
            {items.map((item) => {
              const href = buildNavHref(currentPath, item, type);
              const isCurrent = isCurrentItem(currentPath, item, type);
              return (
                <li key={item}>
                  <Link
                    href={href}
                    className={`
                      block px-2 py-1.5 text-sm rounded
                      hover:bg-background hover:text-primary hover:rounded-lg
                      transition-colors
                      ${isCurrent ? "text-primary" : "text-foreground"}
                    `}
                  >
                    {item}/
                  </Link>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function parentDisplay(
  currentPath: string,
  type: "children" | "siblings",
): string {
  if (type === "children") {
    if (currentPath === "/") return "~/";
    return "~" + currentPath + "/";
  }
  const segments = currentPath.split("/").filter(Boolean);
  if (segments.length === 0) return "~/";
  if (segments.length === 1) return "~/";
  return "~/" + segments.slice(0, -1).join("/") + "/";
}

function isCurrentItem(
  currentPath: string,
  item: string,
  type: "children" | "siblings",
): boolean {
  if (type === "children") return false;

  const segments = currentPath.split("/").filter(Boolean);
  if (segments.length === 0) return false;
  return segments[segments.length - 1] === item;
}
