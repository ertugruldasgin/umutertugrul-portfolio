"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signInWithGitHub(redirectPath: string = "/now") {
  const supabase = await createClient();
  const headersList = await headers();
  const origin =
    headersList.get("origin") || `https://${headersList.get("host")}`;

  const { data } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
    },
  });

  if (data.url) redirect(data.url);
}
