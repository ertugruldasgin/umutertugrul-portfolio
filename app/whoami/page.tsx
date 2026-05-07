import { PageHeader } from "@/components/page-header";
import { SectionDivider } from "@/components/section-divider";
import { SubHeader } from "@/components/sub-header";
import { TerminalCard } from "@/components/terminal-card";
import { Separator } from "@/components/ui/separator";
import { WhoAmIEducation } from "@/components/whoami-education";
import { WhoAmIHeader } from "@/components/whoami-header";

export const metadata = {
  title: "whoami",
};

const educations = [
  {
    schoolName: "Yeditepe University",
    degree: "Bachelor of Computer Engineering",
    location: "Istanbul, TR",
    period: "Expected Graduation Jun 2028",
  },
];

export default function WhoAmIPage() {
  return (
    <div className="flex flex-col gap-12 flex-1 w-full">
      <div className="flex flex-col gap-6">
        <PageHeader title="whoami" description="the long answer" />

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
      </div>
    </div>
  );
}
