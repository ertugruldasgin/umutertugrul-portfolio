import { cn } from "@/lib/utils";

interface TerminalCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function TerminalCard({
  title,
  children,
  className,
}: TerminalCardProps) {
  return (
    <div
      className={cn(
        "relative border border-border text-border rounded-xl w-full",
        className,
      )}
    >
      <div className="absolute -top-2 left-4 px-2 bg-background leading-none">
        {title}
      </div>
      <div className="px-4 py-4 text-sm text-foreground">{children}</div>
    </div>
  );
}
