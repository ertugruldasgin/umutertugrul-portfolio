interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-2 w-full">
      <h1 className="text-6xl font-serif text-primary select-none">{title}</h1>
      {description && (
        <p className="text-xs md:text-sm text-subtle flex gap-2 tracking-wide select-none">
          <span className="text-primary/60 font-mono">#</span>
          {description}
        </p>
      )}
    </header>
  );
}
