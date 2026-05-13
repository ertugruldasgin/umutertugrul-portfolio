import { cn } from "@/lib/utils";

interface SubHeaderProps {
  title: string;
  className?: string;
}

export function SubHeader({ title, className }: SubHeaderProps) {
  return (
    <h2
      className={cn(
        "text-foreground text-sm font-medium font-sans uppercase tracking-widest whitespace-pre-line",
        className,
      )}
    >
      {title}
    </h2>
  );
}
