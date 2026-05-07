interface WhoAmIEducationProps {
  schoolName: string;
  degree: string;
  location?: string;
  period?: string;
  gpa?: string;
}

export function WhoAmIEducation({
  schoolName,
  degree,
  location,
  period,
  gpa,
}: WhoAmIEducationProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-2 w-full">
      <div className="flex flex-col items-start gap-1">
        <h3 className="text-lg font-bold text-foreground leading-none">
          {schoolName}
        </h3>
        <div className="flex flex-col md:flex-row gap-0 md:gap-2">
          <p className="text-sm text-subtle">{degree}</p>
          {gpa && (
            <div className="flex flex-col md:flex-row gap-2">
              <span className="text-subtle hidden md:block">-</span>
              <p className="text-sm text-subtle font-mono">GPA: {gpa}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-start md:items-end gap-1 text-sm">
        {location && (
          <p className="text-lg leading-none text-foreground">{location}</p>
        )}
        {period && <p className="text-subtle font-mono">{period}</p>}
      </div>
    </div>
  );
}
