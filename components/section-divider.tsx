import { cn } from "@/lib/utils";

interface SectionDividerProps {
  title: string;
  className?: string;
  lineClassName?: string;
  titleClassName?: string;
}

export function SectionDivider({
  title,
  className,
  lineClassName,
  titleClassName,
}: SectionDividerProps) {
  return (
    <div className={cn("flex items-center gap-3 w-full", className)}>
      <div className={cn("h-px w-6 bg-primary", lineClassName)} />
      <span className={cn("text-sm leading-none text-primary", titleClassName)}>
        {title}
      </span>
      <div className={cn("h-px flex-1 bg-primary", lineClassName)} />
    </div>
  );
}
