"use client";

import { clsx } from "clsx";
import { useEffect, useState } from "react";

type Props = {
  message: string | null;
  onClear: () => void;
};

export function StatusLine({ message, onClear }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      onClear();
    }, 2400);
    return () => clearTimeout(t);
  }, [message, onClear]);

  return (
    <div
      aria-live="polite"
      className={clsx(
        "fixed bottom-5 left-1/2 z-[1200] -translate-x-1/2 px-4 py-2.5 rounded-full glass text-sm text-[var(--ink)] transition-all duration-300 pointer-events-none",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      )}
    >
      {message}
    </div>
  );
}
