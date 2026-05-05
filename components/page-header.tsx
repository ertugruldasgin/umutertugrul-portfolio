interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="flex flex-col flex-1 gap-2 w-full">
      <h1 className="text-6xl font-serif text-primary select-none">{title}</h1>
      {description && (
        <p className="text-xs md:text-base text-subtle">{description}</p>
      )}
    </header>
  );
}
