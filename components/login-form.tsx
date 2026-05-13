"use client";

import { Button } from "@/components/ui/button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export function LoginForm() {
  const [loading, setLoading] = useState(false);

  const handleGitHubLogin = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <Button
        onClick={handleGitHubLogin}
        disabled={loading}
        className="w-full hover:cursor-pointer rounded-lg hover:bg-primary-hover"
      >
        <GitHubLogoIcon className="mr-2 size-4" />
        {loading ? "redirecting..." : "continue with github"}
      </Button>
    </div>
  );
}
