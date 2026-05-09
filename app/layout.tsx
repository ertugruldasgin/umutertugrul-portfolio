import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { JetBrains_Mono, Instrument_Serif, Geist } from "next/font/google";
import { PathBreadcrumb } from "@/components/path-breadcrumb";
import { CursorAura } from "@/components/cursor-aura";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Umut Ertugrul",
    template: "Umut's %s",
  },
  description: "computer engineering sophomore, builder, homelab tinkerer.",
  metadataBase: new URL("https://umutertugrul.com"),
  openGraph: {
    title: "Umut Ertugrul",
    description: "computer engineering sophomore, builder, homelab tinkerer.",
    url: "https://umutertugrul.com",
    siteName: "Umut Ertugrul",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Umut Ertugrul",
    description: "computer engineering sophomore, builder, homelab tinkerer.",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "bg-background",
        "antialiased",
        "p-2",
        instrumentSerif.variable,
        jetbrainsMono.variable,
        geist.variable,
      )}
    >
      <body className="min-h-full bg-background text-foreground flex flex-col p-2 md:p-4 md:border border-primary rounded-xl font-mono antialiased">
        <CursorAura />
        <PathBreadcrumb />
        <div className="pt-10 w-full max-w-3xl ml-auto mr-auto pb-8">
          {children}
        </div>
      </body>
    </html>
  );
}
