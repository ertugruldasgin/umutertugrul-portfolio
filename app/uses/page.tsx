import { PageHeader } from "@/components/page-header";
import { TerminalCard } from "@/components/terminal-card";

export const metadata = {
  title: "Uses — Umut Ertugrul",
};

export default function UsesPage() {
  return (
    <div className="flex flex-col gap-12 flex-1 w-full">
      <PageHeader
        title="uses"
        description="a list of hardware, software, tools I use daily"
      />

      <TerminalCard title="hardware">
        <ul className="flex flex-col gap-2">
          <li>
            <p>ThinkCentre M910s i5-6500 (4) 16/512</p>
            <p className="text-xs font-bold text-subtle">
              homelab server - debian 13
            </p>
          </li>
          <li>
            <p>ThinkPad T490 i5-8365U (8) 16/512</p>
            <p className="text-xs font-bold text-subtle">
              personal laptop - fedora 44
            </p>
          </li>
          <li>
            <p>Macbook Pro M3 (8-16) 16/512</p>
            <p className="text-xs font-bold text-subtle">
              personal laptop - macos
            </p>
          </li>
          <li>
            <p>Mac Studio M1 Max (10-32) 32/512</p>
            <p className="text-xs font-bold text-subtle">
              lab workstation - macos
            </p>
          </li>
        </ul>
      </TerminalCard>
    </div>
  );
}
