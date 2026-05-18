import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { JetBrains_Mono, Instrument_Serif, Geist } from "next/font/google";
import { PathBreadcrumb } from "@/components/path-breadcrumb";
import { CursorAura } from "@/components/cursor-aura";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Footer } from "@/components/footer";

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
    template: "%s | Umut Ertugrul",
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "umutertugrul",
  },
};

const github = "https://github.com/ertugruldasgin";
const huggingface = "https://huggingface.co/umutertugrul";
const discord = "https://discordapp.com/users/442301448215068672";
const email = "ertugruldasgin@gmail.com";
const linkedin = "https://www.linkedin.com/in/umutertugruldasgin/";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Umut Ertuğrul Daşgın",
  alternateName: ["Umut Ertugrul", "Umut Ertuğrul"],
  url: "https://umutertugrul.com",
  jobTitle: "Computer Engineering Student",
  affiliation: [
    {
      "@type": "EducationalOrganization",
      name: "Yeditepe University",
    },
    {
      "@type": "Organization",
      name: "PerSystLab",
    },
  ],
  knowsAbout: [
    "Software Engineering",
    "Full Stack Web Development",
    "Natural Language Processing",
    "Turkish NLP Datasets",
    "Large Language Models",
    "Web Scraping & Data Collection",
    "Homelab & Self-Hosting",
  ],
  sameAs: [linkedin, github, huggingface, discord],
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
        "scrollbar-hide",
        instrumentSerif.variable,
        jetbrainsMono.variable,
        geist.variable,
      )}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground flex flex-col p-2! md:p-4! md:border border-primary rounded-xl font-mono antialiased">
        <TooltipProvider>
          <CursorAura />
          <PathBreadcrumb />
          <div className="pt-10 w-full pb-8">{children}</div>
          <Footer
            github={github}
            huggingface={huggingface}
            discord={discord}
            email={email}
          />
        </TooltipProvider>
      </body>
    </html>
  );
}
