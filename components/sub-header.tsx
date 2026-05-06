interface SubHeaderProps {
  title: string;
}

export function SubHeader({ title }: SubHeaderProps) {
  return (
    <h2 className="text-foreground text-sm font-medium font-sans uppercase tracking-widest">
      {title}
    </h2>
  );
}
