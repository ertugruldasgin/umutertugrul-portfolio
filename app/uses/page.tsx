import { PageHeader } from "@/components/page-header";
import { TerminalCard } from "@/components/terminal-card";

export const metadata = {
  title: "uses",
};

export default function UsesPage() {
  return (
    <div className="flex flex-col gap-12 flex-1 w-full">
      <PageHeader
        title="uses"
        description="what i reach for, when i sit down"
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

        <TerminalCard
          title="peripherals"
          className="border-warning text-warning"
        >
          <ul className="flex flex-col gap-2">
            <li>
              <p>Samsung ViewFinity S6</p>
              <p className="text-xs font-bold text-subtle">24{'"'} 2K 100Hz</p>
            </li>
            <li>
              <p>Edifier MR4</p>
              <p className="text-xs font-bold text-subtle">
                studio monitor speaker (white)
              </p>
            </li>
            <li>
              <p>Logitech MX Keys Mini for Mac</p>
              <p className="text-xs font-bold text-subtle">
                primary keyboard (pale gray)
              </p>
            </li>
            <li>
              <p>Epomaker SK64S</p>
              <p className="text-xs font-bold text-subtle">
                hot swappable mechanical (white)
              </p>
            </li>
            <li>
              <p>Logitech MX Anywhere 3</p>
              <p className="text-xs font-bold text-subtle">
                primary mouse (white)
              </p>
            </li>
            <li>
              <p>Xiaomi Mi Light Bar</p>
              <p className="text-xs font-bold text-subtle">monitor light bar</p>
            </li>
            <li>
              <p>Casio CDP-S110BK</p>
              <p className="text-xs font-bold text-subtle">digital piano</p>
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
          <TerminalCard
            title="tools"
            className="border-syntax-keyword text-syntax-keyword"
          >
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
              <li>Excalidraw</li>
              <li>Mattermost</li>
            </ul>
          </TerminalCard>
          <TerminalCard
            title="everyone should try"
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
