import { AgeCounter } from "@/components/age-counter";
import AsciiLogo from "@/components/ascii-logo";
import { TerminalCard } from "@/components/terminal-card";

const birthDate = new Date("2004-11-11T00:00:00");

export default function Home() {
  return (
    <div className="flex flex-col flex-1 pt-10 items-left gap-12 max-w-3xl mx-auto">
      <div className="flex flex-col gap-2">
        <pre className="hidden md:block">
          <AsciiLogo />
        </pre>
        <h1 className="block md:hidden text-6xl font-serif text-primary select-none">
          Umut Ertugrul
        </h1>
        <p className="text-xs md:text-base text-subtle">
          ~/.config/turkey/computer-engineering-sophomore
        </p>
      </div>

      <TerminalCard title="whoami" className="border-primary text-primary">
        <p className="text-base text-foreground">
          <AgeCounter birthDate={birthDate} /> years old. Homelab tinkerer. I
          build things I wish existed, usually the ones that fit how I live.
        </p>
      </TerminalCard>
    </div>
  );
}
