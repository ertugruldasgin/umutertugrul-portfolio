import Link from "next/link";

interface SuggestItemProps {
  href: string;
  title: string;
  description: string;
}

export function SuggestItem({ href, title, description }: SuggestItemProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col md:px-2 py-1 font-mono text-sm hover:bg-primary/10 rounded-lg transition-colors"
    >
      <span className="text-primary md:text-foreground group-hover:text-primary-hover transition-colors">
        {title}
      </span>
      <div className="flex flex-row flex-1 gap-2">
        <span className="text-primary/60 font-mono">#</span>

        <span className="text-subtle">{description}</span>
      </div>
    </Link>
  );
}
