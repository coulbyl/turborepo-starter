"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { ArrowRight, Moon, Sun } from "lucide-react";

export default function LandingPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = !mounted || resolvedTheme === "dark";

  return (
    <main className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      <header className="fixed left-0 right-0 top-0 z-40 bg-background">
        <nav className="flex items-center justify-between border-b border-border bg-background/85 px-6 py-4 backdrop-blur-md sm:px-10">
          <span className="text-sm font-black uppercase tracking-[0.24em] text-accent">
            Starter
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={isDark ? "Light mode" : "Dark mode"}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-panel text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <Link
              href="/auth/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-85"
            >
              Get started <ArrowRight size={13} />
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative flex min-h-dvh flex-col items-center justify-center px-6 pt-24 sm:px-10">
        <div className="relative z-10 w-full max-w-xl text-center">
          <h1 className="text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl">
            Turborepo
            <br />
            <span className="text-accent">Starter</span>
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
            A production-ready monorepo boilerplate with NestJS, Next.js,
            Prisma, and React Email — batteries included.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/auth/register"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-7 py-3.5 text-sm font-bold text-accent-foreground transition-all hover:opacity-90 sm:w-auto"
            >
              Create account <ArrowRight size={15} />
            </Link>
            <Link
              href="/auth/login"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border px-7 py-3.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:w-auto"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-4">
          <p className="text-xs text-muted-foreground/35">
            Turborepo Starter — {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </main>
  );
}
