"use client";

import { useEffect, useRef } from "react";

export function CursorAura() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      ref.current.style.transform = `translate3d(${e.clientX - 64}px, ${e.clientY - 64}px, 0)`;
      ref.current.style.opacity = "1";
    };

    const handleMouseLeave = () => {
      if (ref.current) ref.current.style.opacity = "0";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-50 w-32 h-32 rounded-full opacity-0"
      style={{
        background:
          "radial-gradient(circle, rgba(36,195,145,0.15) 0%, transparent 70%)",
        willChange: "transform",
      }}
    />
  );
}
