import AsciiLogo from "@/components/ascii-logo";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-4">
      <pre className="hidden md:block">
        <AsciiLogo />
      </pre>
    </div>
  );
}
