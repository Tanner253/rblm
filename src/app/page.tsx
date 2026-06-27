import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <section className="relative mx-auto max-w-6xl px-4 pt-6 pb-16 sm:pt-10 sm:pb-24">
        <div className="grid lg:grid-cols-[1fr_0.95fr] gap-10 lg:gap-14 items-center">
          <div className="max-w-xl">
            <p className="rise-in text-sm text-[var(--ink-mute)] tracking-wide">
              meme depot · template maker
            </p>
            <h1 className="rise-in rise-in-delay-1 text-display text-[clamp(2.6rem,7vw,4.5rem)] font-semibold mt-4 text-[var(--ink)]">
              Small rabbit.
              <br />
              <span className="text-[var(--mane)]">Big lion mask.</span>
            </h1>
            <p className="rise-in rise-in-delay-2 mt-5 text-base sm:text-lg text-[var(--ink-soft)] leading-relaxed">
              Browse ready-made memes or open the maker with the classic
              rabbit-at-the-desk template. Copy to clipboard, download, paste
              into X, Telegram, Discord — works on mobile too.
            </p>
            <div className="rise-in rise-in-delay-3 mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/create" className="btn-primary">
                Make a meme
                <span aria-hidden>→</span>
              </Link>
              <Link href="/memes" className="btn-quiet">
                Browse depot
              </Link>
            </div>
            <dl className="rise-in rise-in-delay-4 mt-10 grid grid-cols-3 gap-4 border-t border-[var(--glass-line)] pt-6">
              <div>
                <dt className="text-xs text-[var(--ink-mute)]">Copy</dt>
                <dd className="mt-1 text-sm font-medium text-[var(--ink)]">
                  One tap
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--ink-mute)]">Mobile</dt>
                <dd className="mt-1 text-sm font-medium text-[var(--ink)]">
                  Share sheet fallback
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--ink-mute)]">Maker</dt>
                <dd className="mt-1 text-sm font-medium text-[var(--ink)]">
                  Drag text layers
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative rise-in rise-in-delay-2">
            <div
              className="absolute -inset-6 rounded-[2rem] opacity-60 blur-3xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 40% 35%, var(--desk-light), transparent 65%)",
              }}
            />
            <div className="relative mask-drift rounded-[1.5rem] overflow-hidden border border-[var(--glass-line)] shadow-[0_30px_60px_-30px_rgba(36,31,26,0.45)]">
              <Image
                src="/templates/rabbit-lion-mask.png"
                alt="Rabbit behind a lion mask at a laptop"
                width={800}
                height={800}
                priority
                className="w-full h-auto"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--ink)]/35 to-transparent pointer-events-none" />
            </div>
            <p className="mt-4 text-center text-xs text-[var(--ink-mute)]">
              The default template — yours to caption
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--glass-line)] bg-[var(--cream)]/35">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-18 grid sm:grid-cols-2 gap-10">
          <article>
            <h2 className="text-display text-2xl sm:text-3xl font-semibold text-[var(--ink)]">
              The depot
            </h2>
            <p className="mt-3 text-[var(--ink-soft)] leading-relaxed">
              A clean catalog of community memes. Search by title or caption,
              preview full size, copy the image or caption in one click.
            </p>
            <Link
              href="/memes"
              className="link-underline inline-block mt-5 text-sm font-medium text-[var(--accent)]"
            >
              Open the depot
            </Link>
          </article>
          <article>
            <h2 className="text-display text-2xl sm:text-3xl font-semibold text-[var(--ink)]">
              The maker
            </h2>
            <p className="mt-3 text-[var(--ink-soft)] leading-relaxed">
              Add impact-style text, drag it where you want, nudge with arrow
              keys, undo mistakes. Export as PNG — clipboard or download.
            </p>
            <Link
              href="/create"
              className="link-underline inline-block mt-5 text-sm font-medium text-[var(--accent)]"
            >
              Start creating
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
}
