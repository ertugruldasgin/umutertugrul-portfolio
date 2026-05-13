import { LoginForm } from "@/components/login-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/now");

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full max-w-sm mx-auto gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-mono text-2xl font-medium lowercase">login</h1>
        <p className="text-muted-foreground text-sm font-mono">
          authenticate to access private features.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
