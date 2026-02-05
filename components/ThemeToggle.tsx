"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const d = localStorage.getItem("dt-theme") === "dark";
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
  }, []);
  return (
    <button
      className="rounded-lg border px-3 py-1 text-sm"
      onClick={() => {
        const next = !dark;
        setDark(next);
        localStorage.setItem("dt-theme", next ? "dark" : "light");
        document.documentElement.classList.toggle("dark", next);
      }}
    >
      {dark ? "Light" : "Dark"}
    </button>
  );
}
