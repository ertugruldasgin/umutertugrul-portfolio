// app/login/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { signInWithGitHub } from "@/lib/auth";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";

function LoginContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/now";

  return (
    <div className="flex flex-col gap-6 flex-1 w-full max-w-3xl mx-auto">
      <PageHeader title="login" description={<p>authenticate</p>} />
      <button
        onClick={() => signInWithGitHub(from)}
        className="max-w-max flex flex-row gap-2 px-4 py-2 rounded-lg text-sm font-mono text-foreground hover:bg-surface hover:text-primary-hover transition-colors cursor-pointer"
      >
        <SiGithub className="size-4" />
        <p>sign in with github</p>
      </button>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
