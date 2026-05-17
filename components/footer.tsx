"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SiDiscord,
  SiGithub,
  SiHuggingface,
} from "@icons-pack/react-simple-icons";
import { Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface FooterProps {
  github?: string;
  huggingface?: string;
  discord?: string;
  email?: string;
}

export function Footer({ github, huggingface, discord, email }: FooterProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const currentPath = usePathname();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <footer className="w-full border-t pt-4 mt-auto border-primary">
      <div className="max-w-3xl ml-auto mr-auto flex flex-col sm:flex-row flex-1 items-center gap-4 justify-between text-xs sm:text-sm text-subtle font-mono">
        <div className="flex flex-row flex-1 gap-4">
          <p>
            <span className="text-primary/60">$</span> umut ertugrul &copy;{" "}
            {new Date().getFullYear()}
          </p>
          <div>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="text-subtle/60 hover:text-subtle transition-colors cursor-pointer"
              >
                exit
              </button>
            ) : (
              <Link
                href={`/login?from=${encodeURIComponent(currentPath)}`}
                className="text-subtle/60 hover:text-subtle transition-colors"
              >
                su
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {github && (
            <Link href={github} target="_blank" rel="noopener noreferrer">
              <SiGithub className="size-5 hover:text-white transition-colors" />
            </Link>
          )}
          {huggingface && (
            <Link href={huggingface} target="_blank" rel="noopener noreferrer">
              <SiHuggingface className="size-5 hover:text-warning transition-colors" />
            </Link>
          )}
          {discord && (
            <Link href={discord} target="_blank" rel="noopener noreferrer">
              <SiDiscord className="size-5 hover:text-[#5865F2] transition-colors" />
            </Link>
          )}
          {email && (
            <Link href={`mailto:${email}`}>
              <Mail className="size-5 hover:text-primary-hover transition-colors" />
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
