"use client";

import { useEffect, useState } from "react";

interface AgeCounterProps {
  birthDate: Date;
  precision?: number;
}

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

export function AgeCounter({ birthDate, precision = 9 }: AgeCounterProps) {
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    const birth = new Date(birthDate).getTime();

    const update = () => {
      const now = Date.now();
      setAge((now - birth) / MS_PER_YEAR);
    };

    update();
    const interval = setInterval(update, 1000 / 30); // Update at 30 FPS
    return () => clearInterval(interval);
  }, [birthDate]);

  if (age === null) {
    return <span>Calculating...</span>;
  }

  const [integerPart, decimalPart] = age.toFixed(precision).split(".");

  return (
    <span className="text-primary tabular-nums">
      {integerPart}
      <span className="text-subtle">.{decimalPart}</span>
    </span>
  );
}
