import Link from "next/link";

interface WhoAmIItemProps {
  title: string;
  link?: string;
  position?: string;
  location?: string;
  period?: string;
  items: string[];
}

export function WhoAmIItem({
  title,
  link,
  position,
  location,
  period,
  items,
}: WhoAmIItemProps) {
  return (
    <div className="gap-2 w-full">
      <div className="flex flex-col md:flex-row justify-between gap-2 w-full">
        <div className="flex flex-col items-start gap-1">
          {link ? (
            <Link
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-bold text-foreground leading-none hover:text-primary-hover"
            >
              {title}
            </Link>
          ) : (
            <p className="text-lg font-bold text-foreground leading-none">
              {title}
            </p>
          )}
          <div className="flex flex-col md:flex-row gap-0 md:gap-2">
            <p className="text-sm text-subtle">{position}</p>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-1 text-sm">
          {location && (
            <p className="text-lg leading-none text-foreground">{location}</p>
          )}
          {period && <p className="text-subtle font-mono">{period}</p>}
        </div>
      </div>
      <div className="ml-5 mt-2">
        <ul className="flex flex-col gap-2 list-disc">
          {items.map((items, i) => (
            <li key={i}>{items}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
