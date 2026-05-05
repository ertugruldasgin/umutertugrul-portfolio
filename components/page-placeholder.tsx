interface PagePlaceholderProps {
  title: string;
  note?: string;
}

export function PagePlaceholder({ title, note }: PagePlaceholderProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3">
      <h1 className="text-3xl text-primary">{title}</h1>
      {note && <p className="text-sm text-subtle">{note}</p>}
      <p className="text-xs text-subtle italic mt-2">
        placeholder — content coming soon
      </p>
    </div>
  );
}
