import Link from "next/link";

interface WhoAmIHeaderProps {
  name: string;
  github?: string;
  huggingface?: string;
  linkedin?: string;
  email?: string;
  phone?: string;
  website?: string;
}

export function WhoAmIHeader({
  name,
  github,
  huggingface,
  linkedin,
  email,
  phone,
  website,
}: WhoAmIHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-2 w-full">
      <div className="flex flex-col items-start gap-2">
        {website ? (
          <Link
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl leading-none text-foreground hover:text-primary transition-colors"
          >
            {name}
          </Link>
        ) : (
          <span className="text-foreground">{name}</span>
        )}

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {github && <SocialLink href={github} label="GitHub" />}
          {github && huggingface && <Separator />}
          {huggingface && (
            <SocialLink href={huggingface} label="Hugging Face" />
          )}
          {(github || huggingface) && linkedin && <Separator />}
          {linkedin && <SocialLink href={linkedin} label="LinkedIn" />}
        </div>
      </div>

      <div className="flex flex-col items-start md:items-end gap-2 text-sm">
        {email && (
          <Link
            href={`mailto:${email}`}
            className="text-foreground hover:text-primary transition-colors"
          >
            {email}
          </Link>
        )}
        {phone && (
          <Link
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="text-foreground hover:text-primary transition-colors"
          >
            {phone}
          </Link>
        )}
      </div>
    </div>
  );
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-subtle hover:text-primary transition-colors"
    >
      {label}
    </Link>
  );
}

function Separator() {
  return <span className="text-subtle">-</span>;
}
