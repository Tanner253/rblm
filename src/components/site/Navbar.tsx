"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/memes", label: "Depot" },
  { href: "/create", label: "Make one" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 w-full transition-[padding] duration-300",
        scrolled ? "py-2" : "py-4"
      )}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div
          className={clsx(
            "glass flex items-center justify-between rounded-[1.25rem] px-4 transition-all duration-300",
            scrolled ? "py-2" : "py-3"
          )}
        >
          <Link
            href="/"
            className="group flex items-baseline gap-2"
            aria-label="RBLM home"
          >
            <span className="text-display text-xl font-semibold tracking-tight text-[var(--ink)]">
              RBLM
            </span>
            <span className="hidden sm:inline text-xs text-[var(--ink-mute)] group-hover:text-[var(--ink-soft)] transition-colors">
              rabbit · lion · mask
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => {
              const active =
                l.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  data-active={active}
                  className="link-underline text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] data-[active=true]:text-[var(--ink)]"
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/create" className="btn-primary !py-2 !px-4 !text-sm hidden sm:inline-flex">
              Open maker
            </Link>
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--glass-line)] bg-white/50"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                {open ? (
                  <>
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                  </>
                ) : (
                  <>
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <nav className="md:hidden mt-2 glass rounded-[1.25rem] p-3 flex flex-col gap-1 rise-in">
            {links.map((l) => {
              const active =
                l.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={clsx(
                    "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-white/70 text-[var(--ink)]"
                      : "text-[var(--ink-soft)] hover:bg-white/50"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link href="/create" className="btn-primary mt-2 justify-center">
              Open maker
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
