import fs from "node:fs/promises";
import path from "node:path";

export default async function AsciiLogo() {
  const art = await fs.readFile(
    path.join(process.cwd(), "public/assets/ascii-art.txt"),
    "utf-8",
  );

  return (
    <pre
      aria-label="Umut Ertuğrul"
      className="text-primary whitespace-pre-wrap text-center select-none"
    >
      {art}
    </pre>
  );
}
