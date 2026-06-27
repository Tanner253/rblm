import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--glass-line)] bg-[var(--cream)]/40">
      <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <p className="text-display text-2xl font-semibold text-[var(--ink)]">
            RBLM
          </p>
          <p className="mt-2 text-sm text-[var(--ink-mute)] max-w-sm leading-relaxed">
            Small rabbit energy. Loud lion mask. Grab a meme from the depot or
            make your own — copy, download, paste anywhere.
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-3 text-sm">
          <div className="flex gap-6">
            <Link href="/memes" className="link-underline text-[var(--ink-soft)] hover:text-[var(--ink)]">
              Depot
            </Link>
            <Link href="/create" className="link-underline text-[var(--ink-soft)] hover:text-[var(--ink)]">
              Maker
            </Link>
          </div>
          <p className="text-[var(--ink-mute)] text-xs">
            Built for raids, group chats, and quiet keyboard warriors.
          </p>
        </div>
      </div>
    </footer>
  );
}
