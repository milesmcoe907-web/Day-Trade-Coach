"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { InstallPrompt } from "./InstallPrompt";

const nav = [
  ["/", "Dashboard"],
  ["/plan", "Plan"],
  ["/paper", "Paper"],
  ["/backtest", "Backtest"]
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-64 border-r border-zinc-200 p-4 dark:border-zinc-800 md:block">
        <h1 className="mb-4 text-xl font-bold">DayTrade Coach</h1>
        <nav className="space-y-2">
          {nav.map(([href, label]) => (
            <Link key={href} href={href} className={`block rounded p-2 ${pathname === href ? "bg-blue-600 text-white" : "hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 pb-20 md:pb-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200 bg-bg/90 px-4 py-3 backdrop-blur dark:border-zinc-800">
          <p className="font-semibold">Educational only. Not financial advice. Paper trading only.</p>
          <div className="flex gap-2"><InstallPrompt /><ThemeToggle /></div>
        </header>
        <div className="p-4">{children}</div>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 grid grid-cols-4 border-t border-zinc-200 bg-panel md:hidden dark:border-zinc-800">
        {nav.map(([href, label]) => (
          <Link key={href} href={href} className={`p-3 text-center text-xs ${pathname === href ? "text-blue-600" : ""}`}>{label}</Link>
        ))}
      </nav>
    </div>
  );
}
