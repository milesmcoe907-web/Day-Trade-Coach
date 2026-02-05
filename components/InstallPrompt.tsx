"use client";
import { useEffect, useState } from "react";

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null);
  useEffect(() => {
    const listener = (e: any) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", listener as any);
    return () => window.removeEventListener("beforeinstallprompt", listener as any);
  }, []);

  if (!deferred) return null;
  return (
    <button
      onClick={() => deferred.prompt()}
      className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white"
    >
      Install App
    </button>
  );
}
