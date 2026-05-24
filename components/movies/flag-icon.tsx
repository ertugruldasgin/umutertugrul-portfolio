import "flag-icons/css/flag-icons.min.css";

interface FlagIconProps {
  code: string;
  className?: string;
}

export function FlagIcon({ code, className }: FlagIconProps) {
  return <span className={`fi fi-${code.toLowerCase()} ${className || ""}`} />;
}
