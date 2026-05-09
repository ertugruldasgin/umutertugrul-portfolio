async function loadFont(filename: string): Promise<ArrayBuffer> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/fonts/${filename}`);

  if (!res.ok) {
    throw new Error(`Failed to load font: ${filename} (${res.status})`);
  }

  return res.arrayBuffer();
}

export async function getOGFonts() {
  const [regular, bold] = await Promise.all([
    loadFont("JetBrainsMono-Regular.ttf"),
    loadFont("JetBrainsMono-Bold.ttf"),
  ]);

  return [
    {
      name: "JetBrains Mono",
      data: regular,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "JetBrains Mono",
      data: bold,
      weight: 700 as const,
      style: "normal" as const,
    },
  ];
}
