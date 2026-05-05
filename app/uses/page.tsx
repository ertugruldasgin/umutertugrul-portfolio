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

      <div className="flex flex-col gap-8">
        <TerminalCard title="hardware" className="border-primary text-primary">
          <ul className="flex flex-col gap-2">
            <li>
              <p>ThinkCentre M910s i5-6500 (4) 16/512</p>
              <p className="text-xs font-bold text-subtle">
                homelab server - <span className="text-danger">debian 13</span>
              </p>
            </li>
            <li>
              <p>ThinkPad T490 i5-8365U (8) 16/512</p>
              <p className="text-xs font-bold text-subtle">
                personal laptop - <span className="text-info">fedora 44</span>
              </p>
            </li>
            <li>
              <p>Macbook Pro M3 (8-16) 16/512</p>
              <p className="text-xs font-bold text-subtle">
                personal laptop - <span className="text-success">macos</span>
              </p>
            </li>
            <li>
              <p>Mac Studio M1 Max (10-32) 32/512</p>
              <p className="text-xs font-bold text-subtle">
                lab workstation - <span className="text-success">macos</span>
              </p>
            </li>
          </ul>
        </TerminalCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TerminalCard
            title="editor"
            className="border-secondary text-secondary"
          >
            <ul className="flex flex-col gap-2">
              <li>
                <p>VSCode</p>
                <p className="text-xs font-bold text-subtle">
                  primary editor for most tasks
                </p>
              </li>

              <li>
                <p>Zed</p>
                <p className="text-xs font-bold text-subtle">
                  experimental editor
                </p>
              </li>
              <li>
                <p>vim</p>
                <p className="text-xs font-bold text-subtle">
                  in terminal editor
                </p>
              </li>
            </ul>
          </TerminalCard>
          <TerminalCard title="tools" className="border-warning text-warning">
            <ul className="flex flex-col gap-2">
              <li>Tailscale</li>
              <li>Coolify</li>
              <li>AdGuard Home</li>
              <li>Docker</li>
            </ul>
          </TerminalCard>
          <TerminalCard title="daily" className="border-info text-info">
            <ul className="flex flex-col gap-2">
              <li>LibreOffice</li>
              <li>Brave</li>
              <li>Exalidraw</li>
              <li>Mattermost</li>
            </ul>
          </TerminalCard>
          <TerminalCard
            title="favorites"
            className="border-destructive text-destructive"
          >
            <ul className="flex flex-col gap-2">
              <li>tmux</li>
              <li>Self Hosted Supabase</li>
            </ul>
          </TerminalCard>
        </div>
      </div>
    </div>
  );
}
