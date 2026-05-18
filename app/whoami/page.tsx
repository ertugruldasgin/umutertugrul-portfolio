import { PageHeader } from "@/components/page-header";
import { SectionDivider } from "@/components/section-divider";
import { WhoAmIEducation } from "@/components/whoami-education";
import { WhoAmIHeader } from "@/components/whoami-header";
import { WhoAmIItem } from "@/components/whoami-item";

export const metadata = {
  title: "whoami",
  description:
    "Umut Ertuğrul Daşgın — Computer Engineering student at Yeditepe University. Undergraduate researcher at PerSystLab, building Turkish NLP datasets, local LLM pipelines, and full-stack web applications.",
  openGraph: {
    title: "Who is Umut Ertugrul?",
    description:
      "Computer Engineering student at Yeditepe University. Undergraduate researcher, Turkish NLP dataset publisher, and full-stack developer.",
  },
};

const educations = [
  {
    schoolName: "Yeditepe University",
    degree: "Bachelor of Computer Engineering",
    location: "Istanbul, TR",
    period: "Expected Graduation Jun 2028",
  },
];

const experience = [
  {
    title: "PerSystLab (Pervasive Systems Laboratory)",
    link: "https://www.persystlab.org/research/",
    position: "Undergraduate Student Researcher",
    location: "Istanbul, TR",
    period: "Mar 2026 – Present",
    items: [
      "Working on an AI-based educational reporting system to reduce the manual effort in special education reporting workflows, where form-based records often remain difficult to summarize consistently and efficiently.",
      "Designing a local LLM-based summarization pipeline and mobile/server architecture with KVKK-aligned data handling, choosing local processing to maintain full control over sensitive educational records.",
    ],
  },
  {
    title: "Magibu",
    link: "https://huggingface.co/magibu",
    position: "Undergraduate Student Researcher",
    location: "Istanbul, TR",
    period: "May 2025 – Dec 2025",
    items: [
      "Identified the lack of large-scale, domain-specific Turkish datasets as a bottleneck for tokenization and downstream model training, and selected hospital content and TEZYOK thesis abstracts as scalable, high-volume data sources.",
      "Developed source-specific scraping pipelines in Python using requests, cloudscraper, and BeautifulSoup to reverse-engineered its dynamic, session-dependent search flow via GET/POST tracing and scaled extraction across universities and year-based partitions to collect 650,000+ approved thesis abstracts.",
      "Automated preprocessing and dataset publication workflows for deduplication, normalization, and Hugging Face release, producing training-ready datasets that reached 20,000+ downloads and supported downstream training and fine-tuning workflows.",
    ],
  },
];

const projects = [
  {
    title: "7schedule",
    link: "https://7schedule.net",
    items: [
      "Built a course scheduling tool for Yeditepe University students to solve the difficulty of building conflict-free timetables during registration periods, where students had no tooling to compare sections or detect overlaps.",
      "Reverse-engineered the university’s internal course registration API to access structured course data, designed a periodic ingestion pipeline over live fetching, and implemented conflict detection, local schedule persistence, and shareable schedule links for browser-based timetable creation and sharing.",
      "Spread organically through student WhatsApp groups, reaching 4,000+ uses across registration periods.",
    ],
  },
  {
    title: "Rehberiniz App",
    link: "https://play.google.com/store/apps/details?id=com.rehberiniz.app&pcampaignid=web_share&pli=1",
    items: [
      "Built a guidance tracking platform for counselors managing student follow-up manually, with no system for progress monitoring or communication, now actively used by counselors and 30+ students.",
      "Designed and developed the full system independently, including a Flutter mobile app for students and a Next.js web admin panel for counselors, backed by Firebase (Firestore + Realtime Database) for real-time sync, push notifications, assignment and attendance tracking, daily activity sharing, and resource recommendations.",
    ],
  },
  {
    title: "Rehberiniz Web",
    link: "https://www.rehberiniz.app",
    items: [
      "Built a multi-tenant web platform to scale Rehberiniz for counseling institutions with isolated data and access.",
      "Implemented role-based access control for admin, counselor, and student roles with dedicated dashboards, using Supabase Row-Level Security to enforce tenant isolation.",
      "Built a student-level note system with private and public counselor annotations, core features are complete and the platform is in final testing.",
    ],
  },
];

const certifications = [
  {
    title: "Algoleague Algorithm Competition Camp",
    link: "https://drive.google.com/file/d/1IlUm2syb_dl-H-htder2fptZ90pHHrIw/view?pli=1",
    items: [
      "Selected through a 600+ participant qualification round for a week-long algorithm and problem-solving camp; attended Spring 2025 and Summer 2025.",
    ],
  },
  {
    title: "Yeditepe University Academic Summer Research Program",
    items: ["Conducted research on LLM architecture, 2025."],
  },
  {
    title: "Seven Racing, Yeditepe University",
    items: [
      "Software member for the team’s Shell Eco-Marathon vehicle development",
    ],
  },
  {
    title: "TPC’25 (Turkish Programming Contest)",
    items: ["Supported the event as a volunteer in organization."],
  },
];

export default function WhoAmIPage() {
  return (
    <div className="flex flex-col gap-12 flex-1 w-full max-w-3xl ml-auto mr-auto">
      <div className="flex flex-col gap-6">
        <PageHeader title="whoami" description={<p>the long answer</p>} />

        <WhoAmIHeader
          name="Umut Ertugrul Dasgin"
          github="https://github.com/ertugruldasgin"
          huggingface="https://huggingface.co/umutertugrul"
          linkedin="https://www.linkedin.com/in/umutertugruldasgin"
          email="ertugruldasgin@gmail.com"
          phone="+905513975427"
          website="/"
        />

        <div className="flex flex-col gap-2">
          <SectionDivider title="education" />
          <div className="flex flex-col gap-4 mt-2">
            {educations.map((edu, i) => (
              <WhoAmIEducation key={i} {...edu} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <SectionDivider title="experience" />
          <div className="flex flex-col gap-4 mt-2">
            {experience.map((expr, i) => (
              <WhoAmIItem key={i} {...expr} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <SectionDivider title="projects" />
          <div className="flex flex-col gap-4 mt-2">
            {projects.map((prj, i) => (
              <WhoAmIItem key={i} {...prj} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <SectionDivider title="certifications & activities" />
        <div className="flex flex-col gap-4 mt-2">
          {certifications.map((cert, i) => (
            <WhoAmIItem key={i} {...cert} />
          ))}
        </div>
      </div>
    </div>
  );
}
