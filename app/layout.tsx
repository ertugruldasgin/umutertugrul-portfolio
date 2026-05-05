import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { JetBrains_Mono, Instrument_Serif } from "next/font/google";
import { PathBreadcrumb } from "@/components/path-breadcrumb";

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

export const metadata: Metadata = {
  title: "Umut Ertugrul",
  description: "Portfolio of Umut Ertugrul",
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
      )}
    >
      <body className="min-h-full bg-background text-foreground flex flex-col p-4 border-2 border-primary rounded-xl font-mono antialiased">
        <PathBreadcrumb />
        {children}
      </body>
    </html>
  );
}
