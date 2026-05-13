import React from "react";

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-2 w-full">
      <h1 className="text-6xl font-serif text-primary select-none">{title}</h1>
      {description && (
        <div className="text-xs md:text-sm text-subtle flex gap-2 tracking-wide select-none whitespace-pre-line">
          <span className="text-primary/60 font-mono">#</span>
          {description}
        </div>
      )}
    </header>
  );
}
